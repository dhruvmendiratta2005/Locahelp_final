import os
import random
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime, timedelta
from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token
from app.extensions import db
from app.models import User, OTPRequest

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")

def send_otp_email(to_email, otp):
    sender_email = os.getenv("MAIL_USERNAME")
    sender_password = os.getenv("MAIL_PASSWORD")
    
    if not sender_email or not sender_password:
        print(f"Skipping email send (missing credentials). OTP for {to_email} is {otp}")
        return
        
    msg = MIMEMultipart("alternative")
    msg["Subject"] = "Locahelp - Your Login OTP"
    msg["From"] = sender_email
    msg["To"] = to_email

    text = f"Your OTP for logging into Locahelp is: {otp}\nThis code will expire in 10 minutes."
    msg.attach(MIMEText(text, "plain"))

    print(f"===================================================", flush=True)
    print(f"🔔 OTP for {to_email} is: {otp}", flush=True)
    print(f"===================================================", flush=True)

    try:
        # Render's free tier entirely blocks outbound ports 465/587. 
        # Attempting to connect will blackhole the TCP socket and freeze the Waitress worker.
        # server = smtplib.SMTP_SSL("smtp.gmail.com", 465, timeout=5)
        # server.login(sender_email, sender_password)
        # server.sendmail(sender_email, to_email, msg.as_string())
        # server.quit()
        print(f"OTP processing complete (Email blocked by Render, see above).", flush=True)
    except Exception as e:
        print(f"Failed to send OTP email to {to_email}: {e}", flush=True)
        print(f"But don't worry, you can use the OTP printed above! (Render blocks SMTP ports)", flush=True)

@auth_bp.post("/register")
def register():
    data = request.get_json() or {}
    required = ["full_name", "email", "password", "role", "phone"]
    missing = [k for k in required if not data.get(k)]
    if missing:
        return jsonify({"error": f"Missing fields: {', '.join(missing)}"}), 400
    if data["role"] not in ["user", "provider"]:
        return jsonify({"error": "Role must be 'user' or 'provider'"}), 400

    existing = User.query.filter_by(email=data["email"].lower().strip()).first()
    if existing:
        return jsonify({"error": "Email already registered"}), 409

    user = User(
        full_name=data["full_name"].strip(), 
        email=data["email"].lower().strip(), 
        phone=data["phone"].strip(), 
        role=data["role"], 
        city=(data.get("city") or "").strip() or None
    )
    user.set_password(data["password"])
    db.session.add(user)
    db.session.commit()
    return jsonify({"message": "Registered successfully"}), 201

@auth_bp.post("/login")
def login():
    data = request.get_json() or {}
    email = (data.get("email") or "").lower().strip()
    password = data.get("password") or ""
    if not email or not password:
        return jsonify({"error": "Email and password required"}), 400

    user = User.query.filter_by(email=email).first()
    if not user or not user.verify_password(password):
        return jsonify({"error": "Invalid credentials"}), 401

    # Generate OTP
    otp = str(random.randint(100000, 999999))
    
    # Invalidate previous OTPs for this email to keep it clean
    OTPRequest.query.filter_by(email=user.email).delete()
    
    otp_req = OTPRequest(
        email=user.email,
        otp_code=otp,
        expires_at=datetime.utcnow() + timedelta(minutes=10)
    )
    db.session.add(otp_req)
    db.session.commit()

    # Send Email
    send_otp_email(user.email, otp)

    return jsonify({"requires_otp": True, "email": user.email, "message": "OTP sent to your email"}), 200

@auth_bp.post("/verify-otp")
def verify_otp():
    data = request.get_json() or {}
    email = (data.get("email") or "").lower().strip()
    otp_code = data.get("otp") or ""
    
    if not email or not otp_code:
        return jsonify({"error": "Email and OTP required"}), 400
        
    otp_req = OTPRequest.query.filter_by(email=email, otp_code=otp_code).first()
    if not otp_req:
        return jsonify({"error": "Invalid OTP"}), 401
        
    if datetime.utcnow() > otp_req.expires_at:
        db.session.delete(otp_req)
        db.session.commit()
        return jsonify({"error": "OTP has expired"}), 401
        
    # Valid OTP
    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({"error": "User no longer exists"}), 404
        
    token = create_access_token(identity=str(user.id), additional_claims={"role": user.role})
    
    # Clean up OTP
    db.session.delete(otp_req)
    db.session.commit()
    
    return jsonify({"token": token, "user": user.to_dict()}), 200
