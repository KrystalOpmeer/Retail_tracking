from datetime import datetime
from flask_sqlalchemy import SQLAlchemy

# Initialize SQLAlchemy
db = SQLAlchemy()

class Brand(db.Model):
    """
    Model representing a retail brand that owns and manages assets.
    """
    __tablename__ = 'brands'

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    assets = db.relationship('Asset', backref='brand', lazy=True, cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Brand {self.username}>"


class Asset(db.Model):
    """
    Model representing a physical retail asset in a store,
    such as a Display Stand, Shelf Display, Smart Kiosk, etc.
    """
    __tablename__ = 'assets'

    id = db.Column(db.Integer, primary_key=True)
    brand_id = db.Column(db.Integer, db.ForeignKey('brands.id'), nullable=True)
    asset_name = db.Column(db.String(100), nullable=False)
    asset_type = db.Column(db.String(50), nullable=False)  # Display Stand, Shelf Display, etc.
    store_name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=True)
    image = db.Column(db.String(255), nullable=True)        # Filename of uploaded asset banner/image
    qr_code = db.Column(db.String(255), nullable=True)      # Filename of generated QR code image
    scan_count = db.Column(db.Integer, default=0)

    # Relationships
    products = db.relationship('Product', backref='asset', lazy=True, cascade="all, delete-orphan")
    scan_events = db.relationship('ScanEvent', backref='asset', lazy=True, cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Asset {self.asset_name} at {self.store_name}>"


class Product(db.Model):
    """
    Model representing a product associated with a retail asset.
    Multiple products can be linked to a single retail asset.
    """
    __tablename__ = 'products'

    id = db.Column(db.Integer, primary_key=True)
    asset_id = db.Column(db.Integer, db.ForeignKey('assets.id'), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=True)
    price = db.Column(db.Float, nullable=False)
    image = db.Column(db.String(255), nullable=True)        # Filename of product image

    def __repr__(self):
        return f"<Product {self.name} - ${self.price:.2f}>"


class ScanEvent(db.Model):
    """
    Model representing a scan event. Recorded whenever a customer
    scans the QR code and visits the asset landing page.
    Used for analytics and reporting.
    """
    __tablename__ = 'scan_events'

    id = db.Column(db.Integer, primary_key=True)
    asset_id = db.Column(db.Integer, db.ForeignKey('assets.id'), nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    def __repr__(self):
        return f"<ScanEvent Asset {self.asset_id} at {self.timestamp}>"
