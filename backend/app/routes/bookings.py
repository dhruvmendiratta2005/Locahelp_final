from datetime import datetime
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from app.extensions import db
from app.models import Booking, Service

bookings_bp = Blueprint("bookings", __name__, url_prefix="/api/bookings")

@bookings_bp.post("")
@jwt_required()
def create_booking():
    if get_jwt().get("role") != "user":
        return jsonify({"error": "Only users can create bookings"}), 403

    data = request.get_json() or {}
    required = ["service_id", "scheduled_date", "address"]
    missing = [k for k in required if not data.get(k)]
    if missing:
        return jsonify({"error": f"Missing fields: {', '.join(missing)}"}), 400

    service = Service.query.get(data["service_id"])
    if not service:
        return jsonify({"error": "Service not found"}), 404

    try:
        scheduled_date = datetime.strptime(data["scheduled_date"], "%Y-%m-%d").date()
    except ValueError:
        return jsonify({"error": "scheduled_date must be in YYYY-MM-DD format"}), 400

    booking = Booking(service_id=service.id, user_id=int(get_jwt_identity()), provider_id=service.provider_id, scheduled_date=scheduled_date, address=data["address"].strip(), notes=(data.get("notes") or "").strip() or None, status="pending")
    db.session.add(booking)
    db.session.commit()
    return jsonify(booking.to_dict()), 201

@bookings_bp.get("")
@jwt_required()
def list_my_bookings():
    user_id = int(get_jwt_identity())
    role = get_jwt().get("role")
    if role == "user":
        bookings = Booking.query.filter_by(user_id=user_id).order_by(Booking.created_at.desc()).all()
    else:
        bookings = Booking.query.filter_by(provider_id=user_id).order_by(Booking.created_at.desc()).all()
    return jsonify([b.to_dict() for b in bookings]), 200

@bookings_bp.patch("/<int:booking_id>/status")
@jwt_required()
def update_booking_status(booking_id):
    user_id = int(get_jwt_identity())
    role = get_jwt().get("role")
    booking = Booking.query.get(booking_id)
    if not booking:
        return jsonify({"error": "Booking not found"}), 404
    if role != "provider" or booking.provider_id != user_id:
        return jsonify({"error": "Only assigned provider can update this booking"}), 403

    data = request.get_json() or {}
    next_status = (data.get("status") or "").strip().lower()
    if next_status not in ["accepted", "completed", "cancelled"]:
        return jsonify({"error": "Invalid status"}), 400
    if booking.status == "completed":
        return jsonify({"error": "Completed bookings cannot be changed"}), 400

    booking.status = next_status
    db.session.commit()
    return jsonify(booking.to_dict()), 200
