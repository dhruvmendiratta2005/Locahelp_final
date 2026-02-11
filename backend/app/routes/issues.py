from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.extensions import db
from app.models import Issue

issues_bp = Blueprint("issues", __name__, url_prefix="/api/issues")

@issues_bp.post("")
@jwt_required()
def report_issue():
    reporter_id = int(get_jwt_identity())
    data = request.get_json() or {}
    subject = (data.get("subject") or "").strip()
    description = (data.get("description") or "").strip()
    booking_id = data.get("booking_id")

    if not subject or not description:
        return jsonify({"error": "subject and description are required"}), 400

    issue = Issue(reporter_id=reporter_id, booking_id=booking_id, subject=subject, description=description, status="open")
    db.session.add(issue)
    db.session.commit()
    return jsonify(issue.to_dict()), 201

@issues_bp.get("")
@jwt_required()
def list_my_issues():
    reporter_id = int(get_jwt_identity())
    issues = Issue.query.filter_by(reporter_id=reporter_id).order_by(Issue.created_at.desc()).all()
    return jsonify([i.to_dict() for i in issues]), 200
