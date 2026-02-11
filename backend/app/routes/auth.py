from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token
from app.extensions import db
from app.models import User

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")

@auth_bp.post("/register")
def register():
    data = request.get_json() or {}
    required = ["full_name", "email", "password", "role"]
    missing = [k for k in required if not data.get(k)]
    if missing:
        return jsonify({"error": f"Missing fields: {', '.join(missing)}"}), 400
    if data["role"] not in ["user", "provider"]:
        return jsonify({"error": "Role must be 'user' or 'provider'"}), 400

    existing = User.query.filter_by(email=data["email"].lower().strip()).first()
    if existing:
        return jsonify({"error": "Email already registered"}), 409

    user = User(full_name=data["full_name"].strip(), email=data["email"].lower().strip(), phone=(data.get("phone") or "").strip() or None, role=data["role"], city=(data.get("city") or "").strip() or None)
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

    token = create_access_token(identity=str(user.id), additional_claims={"role": user.role})
    return jsonify({"token": token, "user": user.to_dict()}), 200
