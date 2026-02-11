from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.extensions import db
from app.models import User, UserProfile

profile_bp = Blueprint("profile", __name__, url_prefix="/api/profile")


def _profile_payload(user, profile):
    return {
        "id": user.id,
        "full_name": user.full_name,
        "email": user.email,
        "phone": user.phone,
        "city": user.city,
        "role": user.role,
        "home_address": profile.home_address if profile else None,
        "office_address": profile.office_address if profile else None,
    }


@profile_bp.get("")
@jwt_required()
def get_profile():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    return jsonify(_profile_payload(user, user.profile)), 200


@profile_bp.put("")
@jwt_required()
def update_profile():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    data = request.get_json() or {}

    full_name = (data.get("full_name") or "").strip()
    email = (data.get("email") or "").strip().lower()
    phone = (data.get("phone") or "").strip() or None
    city = (data.get("city") or "").strip() or None
    home_address = (data.get("home_address") or "").strip() or None
    office_address = (data.get("office_address") or "").strip() or None

    if not full_name:
        return jsonify({"error": "Full name is required"}), 400
    if not email:
        return jsonify({"error": "Email is required"}), 400

    existing = User.query.filter(User.email == email, User.id != user_id).first()
    if existing:
        return jsonify({"error": "Email already in use"}), 409

    user.full_name = full_name
    user.email = email
    user.phone = phone
    user.city = city

    profile = user.profile
    if not profile:
        profile = UserProfile(user_id=user.id)
        db.session.add(profile)

    profile.home_address = home_address
    profile.office_address = office_address

    db.session.commit()
    return jsonify(_profile_payload(user, profile)), 200
