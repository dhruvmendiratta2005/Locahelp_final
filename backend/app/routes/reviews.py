from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from app.extensions import db
from app.models import Booking, Review

reviews_bp = Blueprint("reviews", __name__, url_prefix="/api/reviews")

@reviews_bp.post("")
@jwt_required()
def create_review():
    if get_jwt().get("role") != "user":
        return jsonify({"error": "Only users can add reviews"}), 403

    user_id = int(get_jwt_identity())
    data = request.get_json() or {}
    booking_id = data.get("booking_id")
    rating = data.get("rating")
    comment = (data.get("comment") or "").strip() or None

    if not booking_id or not rating:
        return jsonify({"error": "booking_id and rating are required"}), 400

    booking = Booking.query.get(booking_id)
    if not booking:
        return jsonify({"error": "Booking not found"}), 404
    if booking.user_id != user_id:
        return jsonify({"error": "You can only review your own bookings"}), 403
    if booking.status != "completed":
        return jsonify({"error": "Review allowed only for completed bookings"}), 400

    try:
        rating_int = int(rating)
    except (TypeError, ValueError):
        return jsonify({"error": "Rating must be an integer"}), 400
    if rating_int < 1 or rating_int > 5:
        return jsonify({"error": "Rating must be between 1 and 5"}), 400

    already = Review.query.filter_by(booking_id=booking.id).first()
    if already:
        return jsonify({"error": "Booking already reviewed"}), 409

    review = Review(booking_id=booking.id, user_id=user_id, provider_id=booking.provider_id, rating=rating_int, comment=comment)
    db.session.add(review)
    db.session.commit()
    return jsonify(review.to_dict()), 201

@reviews_bp.get("/provider/<int:provider_id>")
def provider_reviews(provider_id):
    reviews = Review.query.filter_by(provider_id=provider_id).order_by(Review.created_at.desc()).all()
    if not reviews:
        return jsonify({"average_rating": 0, "count": 0, "reviews": []}), 200
    avg = round(sum(r.rating for r in reviews) / len(reviews), 2)
    return jsonify({"average_rating": avg, "count": len(reviews), "reviews": [r.to_dict() for r in reviews]}), 200
