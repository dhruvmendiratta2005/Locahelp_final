from flask import Flask
from flask_cors import CORS
from .config import Config
from .extensions import db, migrate, jwt
from .models import User, Service
from .routes.auth import auth_bp
from .routes.services import services_bp
from .routes.bookings import bookings_bp
from .routes.reviews import reviews_bp
from .routes.issues import issues_bp
from .routes.health import health_bp


def seed_default_services():
    seed_providers = [
        {
            "full_name": "Ramesh Plumbing Works",
            "email": "provider.plumber@locahelp.local",
            "phone": "9000000001",
            "city": "Pune",
            "services": [
                {
                    "title": "Home Plumbing Repair",
                    "category": "Plumbing",
                    "description": "Leak fixes, tap replacement, pipe blockage removal.",
                    "base_price": 499,
                }
            ],
        },
        {
            "full_name": "Spark Electrical Services",
            "email": "provider.electrician@locahelp.local",
            "phone": "9000000002",
            "city": "Pune",
            "services": [
                {
                    "title": "Electrician Visit",
                    "category": "Electrician",
                    "description": "Wiring checks, switchboard repair, fan and light fitting.",
                    "base_price": 599,
                }
            ],
        },
        {
            "full_name": "TasteBuds Home Cooks",
            "email": "provider.cook@locahelp.local",
            "phone": "9000000003",
            "city": "Pune",
            "services": [
                {
                    "title": "Home Cook Service",
                    "category": "Cook",
                    "description": "Daily meal preparation with custom menu preferences.",
                    "base_price": 799,
                }
            ],
        },
        {
            "full_name": "NeatNest Cleaning Co.",
            "email": "provider.cleaning@locahelp.local",
            "phone": "9000000004",
            "city": "Mumbai",
            "services": [
                {
                    "title": "Deep Home Cleaning",
                    "category": "Cleaning",
                    "description": "Kitchen, bathroom, and full-home deep cleaning service.",
                    "base_price": 1199,
                }
            ],
        },
        {
            "full_name": "FixIt Carpenter Studio",
            "email": "provider.carpenter@locahelp.local",
            "phone": "9000000005",
            "city": "Bengaluru",
            "services": [
                {
                    "title": "Carpentry and Furniture Repair",
                    "category": "Carpenter",
                    "description": "Door repair, shelf installation, and furniture fixes.",
                    "base_price": 699,
                }
            ],
        },
        {
            "full_name": "CoolCare AC Experts",
            "email": "provider.ac@locahelp.local",
            "phone": "9000000006",
            "city": "Delhi",
            "services": [
                {
                    "title": "AC Service and Repair",
                    "category": "AC Service",
                    "description": "AC cleaning, gas refill support, and repair diagnostics.",
                    "base_price": 999,
                }
            ],
        },
    ]

    for provider_data in seed_providers:
        provider = User.query.filter_by(email=provider_data["email"]).first()
        if not provider:
            provider = User(
                full_name=provider_data["full_name"],
                email=provider_data["email"],
                phone=provider_data["phone"],
                role="provider",
                city=provider_data["city"],
            )
            provider.set_password("Password@123")
            db.session.add(provider)
            db.session.flush()

        for service_data in provider_data["services"]:
            existing_service = Service.query.filter_by(
                provider_id=provider.id, title=service_data["title"]
            ).first()
            if not existing_service:
                db.session.add(
                    Service(
                        provider_id=provider.id,
                        title=service_data["title"],
                        category=service_data["category"],
                        description=service_data["description"],
                        city=provider_data["city"],
                        base_price=service_data["base_price"],
                    )
                )

    db.session.commit()


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    CORS(app, resources={r"/api/*": {"origins": "*"}})

    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)

    app.register_blueprint(health_bp)
    app.register_blueprint(auth_bp)
    app.register_blueprint(services_bp)
    app.register_blueprint(bookings_bp)
    app.register_blueprint(reviews_bp)
    app.register_blueprint(issues_bp)

    with app.app_context():
        db.create_all()
        seed_default_services()

    return app
