from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from app.extensions import db
from app.models import Service, User

services_bp = Blueprint("services", __name__, url_prefix="/api/services")

@services_bp.get("")
def list_services():
    category = (request.args.get("category") or "").strip()
    city = (request.args.get("city") or "").strip()
    q = Service.query
    if category:
        q = q.filter(Service.category.ilike(f"%{category}%"))
    if city:
        q = q.filter(Service.city.ilike(f"%{city}%"))
    return jsonify([s.to_dict() for s in q.order_by(Service.created_at.desc()).all()]), 200

@services_bp.get("/provider/<int:provider_id>")
def list_provider_services(provider_id):
    services = Service.query.filter_by(provider_id=provider_id).order_by(Service.created_at.desc()).all()
    return jsonify([s.to_dict() for s in services]), 200

@services_bp.post("")
@jwt_required()
def create_service():
    if get_jwt().get("role") != "provider":
        return jsonify({"error": "Only providers can create services"}), 403

    data = request.get_json() or {}
    required = ["title", "category", "description", "city", "base_price"]
    missing = [k for k in required if data.get(k) in [None, ""]]
    if missing:
        return jsonify({"error": f"Missing fields: {', '.join(missing)}"}), 400

    provider_id = int(get_jwt_identity())
    provider = User.query.get(provider_id)
    if not provider or provider.role != "provider":
        return jsonify({"error": "Invalid provider account"}), 403

    service = Service(provider_id=provider_id, title=data["title"].strip(), category=data["category"].strip(), description=data["description"].strip(), city=data["city"].strip(), base_price=float(data["base_price"]))
    db.session.add(service)
    db.session.commit()
    return jsonify(service.to_dict()), 201
