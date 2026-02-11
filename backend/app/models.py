from datetime import datetime
from sqlalchemy import CheckConstraint, UniqueConstraint
from passlib.hash import pbkdf2_sha256
from .extensions import db


class User(db.Model):
    __tablename__ = "users"
    id = db.Column(db.Integer, primary_key=True)
    full_name = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    phone = db.Column(db.String(20), nullable=True)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(20), nullable=False)
    city = db.Column(db.String(80), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    services = db.relationship("Service", backref="provider", lazy=True, cascade="all, delete-orphan")
    user_bookings = db.relationship("Booking", foreign_keys="Booking.user_id", backref="customer", lazy=True)
    provider_bookings = db.relationship("Booking", foreign_keys="Booking.provider_id", backref="booked_provider", lazy=True)

    __table_args__ = (CheckConstraint("role in ('user', 'provider')", name="chk_user_role"),)

    def set_password(self, raw_password: str):
        self.password_hash = pbkdf2_sha256.hash(raw_password)

    def verify_password(self, raw_password: str) -> bool:
        return pbkdf2_sha256.verify(raw_password, self.password_hash)

    def to_dict(self):
        return {"id": self.id, "full_name": self.full_name, "email": self.email, "phone": self.phone, "role": self.role, "city": self.city}


class Service(db.Model):
    __tablename__ = "services"
    id = db.Column(db.Integer, primary_key=True)
    provider_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, index=True)
    title = db.Column(db.String(120), nullable=False)
    category = db.Column(db.String(80), nullable=False, index=True)
    description = db.Column(db.Text, nullable=False)
    city = db.Column(db.String(80), nullable=False, index=True)
    base_price = db.Column(db.Float, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    def to_dict(self):
        return {"id": self.id, "provider_id": self.provider_id, "provider_name": self.provider.full_name if self.provider else None, "title": self.title, "category": self.category, "description": self.description, "city": self.city, "base_price": self.base_price}


class Booking(db.Model):
    __tablename__ = "bookings"
    id = db.Column(db.Integer, primary_key=True)
    service_id = db.Column(db.Integer, db.ForeignKey("services.id"), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, index=True)
    provider_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, index=True)
    scheduled_date = db.Column(db.Date, nullable=False)
    address = db.Column(db.String(255), nullable=False)
    notes = db.Column(db.Text, nullable=True)
    status = db.Column(db.String(20), nullable=False, default="pending", index=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    service = db.relationship("Service", backref="bookings")

    __table_args__ = (CheckConstraint("status in ('pending', 'accepted', 'completed', 'cancelled')", name="chk_booking_status"),)

    def to_dict(self):
        return {"id": self.id, "service_id": self.service_id, "service_title": self.service.title if self.service else None, "user_id": self.user_id, "user_name": self.customer.full_name if self.customer else None, "provider_id": self.provider_id, "provider_name": self.booked_provider.full_name if self.booked_provider else None, "scheduled_date": self.scheduled_date.isoformat(), "address": self.address, "notes": self.notes, "status": self.status, "created_at": self.created_at.isoformat()}


class Review(db.Model):
    __tablename__ = "reviews"
    id = db.Column(db.Integer, primary_key=True)
    booking_id = db.Column(db.Integer, db.ForeignKey("bookings.id"), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, index=True)
    provider_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, index=True)
    rating = db.Column(db.Integer, nullable=False)
    comment = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    __table_args__ = (
        CheckConstraint("rating >= 1 and rating <= 5", name="chk_rating_range"),
        UniqueConstraint("booking_id", name="uq_review_booking_once"),
    )

    def to_dict(self):
        return {"id": self.id, "booking_id": self.booking_id, "user_id": self.user_id, "provider_id": self.provider_id, "rating": self.rating, "comment": self.comment, "created_at": self.created_at.isoformat()}


class Issue(db.Model):
    __tablename__ = "issues"
    id = db.Column(db.Integer, primary_key=True)
    reporter_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, index=True)
    booking_id = db.Column(db.Integer, db.ForeignKey("bookings.id"), nullable=True)
    subject = db.Column(db.String(140), nullable=False)
    description = db.Column(db.Text, nullable=False)
    status = db.Column(db.String(20), nullable=False, default="open")
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    __table_args__ = (CheckConstraint("status in ('open', 'in_progress', 'resolved')", name="chk_issue_status"),)

    def to_dict(self):
        return {"id": self.id, "reporter_id": self.reporter_id, "booking_id": self.booking_id, "subject": self.subject, "description": self.description, "status": self.status, "created_at": self.created_at.isoformat()}
