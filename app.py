import os
import uuid
from datetime import datetime
from functools import wraps
from flask import Flask, render_template, request, redirect, url_for, flash, jsonify, g
from flask_cors import CORS
from werkzeug.utils import secure_filename
from werkzeug.security import generate_password_hash, check_password_hash
from itsdangerous import URLSafeTimedSerializer, SignatureExpired, BadSignature
import qrcode
from models import db, Brand, Asset, Product, ScanEvent

# Initialize Flask App
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes (React dev server on port 5173)

# Configuration
BASE_DIR = os.path.abspath(os.path.dirname(__file__))

# Security key loading from env
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev-secret-key-for-smart-retail-asset-platform-mvp')

# Database connection loading from env (supports postgresql out of the box)
db_url = os.environ.get('DATABASE_URL', 'sqlite:///' + os.path.join(BASE_DIR, 'retail_platform.db'))
if db_url.startswith("postgres://"):
    db_url = db_url.replace("postgres://", "postgresql://", 1)
app.config['SQLALCHEMY_DATABASE_URI'] = db_url
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# File upload settings
UPLOAD_FOLDER = os.path.join(BASE_DIR, 'static', 'uploads')
QR_FOLDER = os.path.join(BASE_DIR, 'static', 'qr_codes')
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'webp', 'gif'}

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['QR_FOLDER'] = QR_FOLDER

# Ensure static directories exist
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(QR_FOLDER, exist_ok=True)
os.makedirs(os.path.join(BASE_DIR, 'static', 'css'), exist_ok=True)

# Bind SQLAlchemy to application
db.init_app(app)


def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


def generate_qr_code(asset_id, host_url):
    target_url = f"{host_url.rstrip('/')}/asset/{asset_id}"
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_H,
        box_size=10,
        border=4,
    )
    qr.add_data(target_url)
    qr.make(fit=True)
    img = qr.make_image(fill_color="#09090b", back_color="#ffffff")
    filename = f"qr_asset_{asset_id}.png"
    file_path = os.path.join(app.config['QR_FOLDER'], filename)
    img.save(file_path)
    return filename


def asset_to_dict(asset, include_products=True):
    """Serialize an Asset model to a JSON-safe dict."""
    host = request.host_url.rstrip('/')
    d = {
        "id": asset.id,
        "brand_id": asset.brand_id,
        "asset_name": asset.asset_name,
        "asset_type": asset.asset_type,
        "store_name": asset.store_name,
        "description": asset.description,
        "image": asset.image,
        "image_url": f"{host}/static/uploads/{asset.image}" if asset.image else None,
        "qr_code": asset.qr_code,
        "qr_code_url": f"{host}/static/qr_codes/{asset.qr_code}" if asset.qr_code else None,
        "scan_count": asset.scan_count,
    }
    if include_products:
        d["products"] = [product_to_dict(p) for p in asset.products]
    return d


def product_to_dict(product):
    """Serialize a Product model to a JSON-safe dict."""
    host = request.host_url.rstrip('/')
    return {
        "id": product.id,
        "asset_id": product.asset_id,
        "name": product.name,
        "description": product.description,
        "price": product.price,
        "image": product.image,
        "image_url": f"{host}/static/uploads/{product.image}" if product.image else None,
    }


def seed_initial_data():
    # Ensure a default demo brand exists
    demo_brand = Brand.query.filter_by(email="demo@ibtso.com").first()
    if not demo_brand:
        demo_brand = Brand(
            username="demo",
            email="demo@ibtso.com",
            password_hash=generate_password_hash("password123")
        )
        db.session.add(demo_brand)
        db.session.commit()

    if Asset.query.count() == 0:
        beverage_asset = Asset(
            brand_id=demo_brand.id,
            asset_name="Beverage Summer Promo Stand",
            asset_type="Display Stand",
            store_name="Supermarket Central",
            description="A premium double-sided cooling stand highlighting brand new tropical flavored soda releases and promotional discount packs.",
            image="seed_asset.jpg",
            scan_count=12
        )
        db.session.add(beverage_asset)
        db.session.commit()

        prod1 = Product(
            asset_id=beverage_asset.id,
            name="Tropical Mango Soda (Pack of 6)",
            description="Premium carbonated drink infused with natural pulp. Freshly sweetened with organic sugarcane juice.",
            price=8.99,
            image="seed_product_1.jpg"
        )
        prod2 = Product(
            asset_id=beverage_asset.id,
            name="Guava Lime Sparkler 500ml",
            description="Single serving bottle, tangy guava meeting fresh key lime zest. Best served chilled over crushed ice.",
            price=1.99,
            image="seed_product_2.jpg"
        )
        db.session.add_all([prod1, prod2])

        from datetime import timedelta
        for days_back in [4, 3, 3, 2, 2, 2, 1, 0, 0, 0, 0, 0]:
            event = ScanEvent(
                asset_id=beverage_asset.id,
                timestamp=datetime.utcnow() - timedelta(days=days_back)
            )
            db.session.add(event)

        db.session.commit()

        try:
            from PIL import Image, ImageDraw
            img_asset = Image.new('RGB', (800, 400), color='#6366f1')
            d_asset = ImageDraw.Draw(img_asset)
            d_asset.text((320, 190), "SUMMER SODA PROMO", fill='#ffffff')
            img_asset.save(os.path.join(app.config['UPLOAD_FOLDER'], "seed_asset.jpg"))

            img_p1 = Image.new('RGB', (400, 400), color='#a855f7')
            d_p1 = ImageDraw.Draw(img_p1)
            d_p1.text((150, 190), "MANGO 6-PACK", fill='#ffffff')
            img_p1.save(os.path.join(app.config['UPLOAD_FOLDER'], "seed_product_1.jpg"))

            img_p2 = Image.new('RGB', (400, 400), color='#10b981')
            d_p2 = ImageDraw.Draw(img_p2)
            d_p2.text((150, 190), "GUAVA SPARKLER", fill='#ffffff')
            img_p2.save(os.path.join(app.config['UPLOAD_FOLDER'], "seed_product_2.jpg"))
        except Exception as e:
            print(f"Error creating seed image files: {e}")

        beverage_asset.qr_code = generate_qr_code(beverage_asset.id, os.environ.get('FRONTEND_URL', 'http://127.0.0.1:5173/'))
        db.session.commit()


with app.app_context():
    # Safe migration: add brand_id column to assets if it's missing
    try:
        engine = db.engine
        from sqlalchemy import inspect
        inspector = inspect(engine)
        if 'assets' in inspector.get_table_names():
            columns = [c['name'] for c in inspector.get_columns('assets')]
            if 'brand_id' not in columns:
                with engine.connect() as conn:
                    conn.execute(db.text("ALTER TABLE assets ADD COLUMN brand_id INTEGER REFERENCES brands(id)"))
                    conn.commit()
                    print("Successfully added brand_id column to assets table via safe migration.")
    except Exception as migration_error:
        print(f"Safe migration info: {migration_error}")

    db.create_all()
    seed_initial_data()

    # Link any orphaned assets (without a brand_id) to the demo brand
    try:
        demo_brand = Brand.query.filter_by(email="demo@ibtso.com").first()
        if demo_brand:
            orphaned = Asset.query.filter(Asset.brand_id.is_(None)).all()
            if orphaned:
                for asset in orphaned:
                    asset.brand_id = demo_brand.id
                db.session.commit()
                print(f"Linked {len(orphaned)} orphaned assets to demo brand.")
    except Exception as orphaned_error:
        print(f"Error linking orphaned assets: {orphaned_error}")


# ─────────────────────────────────────────────────────────────────────────────
# AUTHENTICATION DECORATOR & ROUTES
# ─────────────────────────────────────────────────────────────────────────────

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            if auth_header.startswith('Bearer '):
                token = auth_header.split(" ")[1]
        
        if not token:
            return jsonify({'error': 'Token is missing'}), 401
        
        try:
            serializer = URLSafeTimedSerializer(app.config['SECRET_KEY'])
            data = serializer.loads(token, salt='brand-auth', max_age=604800) # 7 days
            current_brand = Brand.query.get(data['brand_id'])
            if not current_brand:
                return jsonify({'error': 'Brand not found'}), 401
            g.current_brand = current_brand
        except SignatureExpired:
            return jsonify({'error': 'Token has expired'}), 401
        except BadSignature:
            return jsonify({'error': 'Token is invalid'}), 401
        
        return f(*args, **kwargs)
    return decorated


@app.route('/api/auth/register', methods=['POST'])
def api_register():
    data = request.get_json() or {}
    username = data.get('username', '').strip()
    email = data.get('email', '').strip()
    password = data.get('password', '').strip()

    if not username or not email or not password:
        return jsonify({"error": "Username, email, and password are required."}), 400

    if Brand.query.filter_by(username=username).first():
        return jsonify({"error": "Username already taken."}), 400

    if Brand.query.filter_by(email=email).first():
        return jsonify({"error": "Email already registered."}), 400

    try:
        new_brand = Brand(
            username=username,
            email=email,
            password_hash=generate_password_hash(password)
        )
        db.session.add(new_brand)
        db.session.commit()

        serializer = URLSafeTimedSerializer(app.config['SECRET_KEY'])
        token = serializer.dumps({"brand_id": new_brand.id}, salt='brand-auth')

        return jsonify({
            "success": True,
            "token": token,
            "user": {
                "id": new_brand.id,
                "username": new_brand.username,
                "email": new_brand.email
            }
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@app.route('/api/auth/login', methods=['POST'])
def api_login():
    data = request.get_json() or {}
    email = data.get('email', '').strip()
    password = data.get('password', '').strip()

    if not email or not password:
        return jsonify({"error": "Email and password are required."}), 400

    brand = Brand.query.filter_by(email=email).first()
    if not brand or not check_password_hash(brand.password_hash, password):
        return jsonify({"error": "Invalid email or password."}), 401

    serializer = URLSafeTimedSerializer(app.config['SECRET_KEY'])
    token = serializer.dumps({"brand_id": brand.id}, salt='brand-auth')

    return jsonify({
        "success": True,
        "token": token,
        "user": {
            "id": brand.id,
            "username": brand.username,
            "email": brand.email
        }
    })


@app.route('/api/auth/me', methods=['GET'])
@token_required
def api_me():
    return jsonify({
        "id": g.current_brand.id,
        "username": g.current_brand.username,
        "email": g.current_brand.email
    })


# ─────────────────────────────────────────────────────────────────────────────
# REST API ROUTES
# ─────────────────────────────────────────────────────────────────────────────

@app.route('/api/dashboard')
@token_required
def api_dashboard():
    """Summary stats + assets list + chart data for the brand dashboard."""
    brand_id = g.current_brand.id
    assets = Asset.query.filter_by(brand_id=brand_id).all()
    total_assets = len(assets)
    
    total_products = Product.query.join(Asset).filter(Asset.brand_id == brand_id).count()
    total_scans = db.session.query(db.func.sum(Asset.scan_count)).filter(Asset.brand_id == brand_id).scalar() or 0

    scan_history = db.session.query(
        db.func.date(ScanEvent.timestamp).label('scan_date'),
        db.func.count(ScanEvent.id).label('scan_count')
    ).join(Asset).filter(Asset.brand_id == brand_id).group_by('scan_date').order_by('scan_date').limit(14).all()

    dates = [row.scan_date for row in scan_history]
    counts = [row.scan_count for row in scan_history]
    if not dates:
        dates = [datetime.utcnow().strftime('%Y-%m-%d')]
        counts = [0]

    return jsonify({
        "total_assets": total_assets,
        "total_products": total_products,
        "total_scans": total_scans,
        "assets": [asset_to_dict(a, include_products=True) for a in assets],
        "chart_dates": dates,
        "chart_counts": counts,
    })


@app.route('/api/assets', methods=['GET'])
@token_required
def api_get_assets():
    """List all retail assets for the current brand."""
    assets = Asset.query.filter_by(brand_id=g.current_brand.id).all()
    return jsonify([asset_to_dict(a) for a in assets])


@app.route('/api/assets', methods=['POST'])
@token_required
def api_create_asset():
    """Create a new retail asset for the brand. Accepts multipart/form-data."""
    asset_name = request.form.get('asset_name', '').strip()
    asset_type = request.form.get('asset_type', '').strip()
    store_name = request.form.get('store_name', '').strip()
    description = request.form.get('description', '').strip()

    if not asset_name or not asset_type or not store_name:
        return jsonify({"error": "asset_name, asset_type, and store_name are required."}), 400

    image_filename = None
    file = request.files.get('image')
    if file and file.filename:
        if allowed_file(file.filename):
            unique_prefix = uuid.uuid4().hex[:8]
            image_filename = f"{unique_prefix}_{secure_filename(file.filename)}"
            file.save(os.path.join(app.config['UPLOAD_FOLDER'], image_filename))
        else:
            return jsonify({"error": "Invalid image format. Use PNG, JPG, JPEG, WEBP or GIF."}), 400

    try:
        new_asset = Asset(
            brand_id=g.current_brand.id,
            asset_name=asset_name,
            asset_type=asset_type,
            store_name=store_name,
            description=description,
            image=image_filename,
            scan_count=0
        )
        db.session.add(new_asset)
        db.session.commit()

        host_url = request.form.get('host_url') or os.environ.get('FRONTEND_URL') or request.host_url
        qr_filename = generate_qr_code(new_asset.id, host_url)
        new_asset.qr_code = qr_filename
        db.session.commit()

        return jsonify(asset_to_dict(new_asset)), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@app.route('/api/assets/<int:asset_id>', methods=['GET'])
def api_get_asset(asset_id):
    """Get a single asset with its products. Does NOT count as a scan."""
    asset = Asset.query.get_or_404(asset_id)
    return jsonify(asset_to_dict(asset, include_products=True))


@app.route('/api/assets/<int:asset_id>', methods=['DELETE'])
@token_required
def api_delete_asset(asset_id):
    """Delete an asset and all linked products and media files."""
    asset = Asset.query.get_or_404(asset_id)
    if asset.brand_id != g.current_brand.id:
        return jsonify({"error": "You do not have permission to delete this asset."}), 403
    try:
        if asset.image and asset.image != "seed_asset.jpg":
            try:
                os.remove(os.path.join(app.config['UPLOAD_FOLDER'], asset.image))
            except OSError:
                pass
        if asset.qr_code:
            try:
                os.remove(os.path.join(app.config['QR_FOLDER'], asset.qr_code))
            except OSError:
                pass
        for product in asset.products:
            if product.image and not product.image.startswith("seed_product_"):
                try:
                    os.remove(os.path.join(app.config['UPLOAD_FOLDER'], product.image))
                except OSError:
                    pass

        db.session.delete(asset)
        db.session.commit()
        return jsonify({"success": True, "message": "Asset deleted."})
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@app.route('/api/assets/<int:asset_id>/scan', methods=['GET'])
def api_asset_scan(asset_id):
    """
    Customer QR scan endpoint. Returns asset + products and RECORDS the scan.
    Called by the React AssetView page when loaded without preview mode.
    """
    asset = Asset.query.get_or_404(asset_id)
    try:
        asset.scan_count += 1
        scan_event = ScanEvent(asset_id=asset.id)
        db.session.add(scan_event)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        print(f"Failed to record scan for asset {asset_id}: {e}")

    return jsonify(asset_to_dict(asset, include_products=True))


@app.route('/api/assets/<int:asset_id>/simulate-scan', methods=['POST'])
@token_required
def api_simulate_scan(asset_id):
    """Test/simulate a QR scan from the brand dashboard. Returns updated stats."""
    asset = Asset.query.get_or_404(asset_id)
    if asset.brand_id != g.current_brand.id:
        return jsonify({"error": "You do not have permission to simulate a scan on this asset."}), 403

    try:
        asset.scan_count += 1
        scan_event = ScanEvent(asset_id=asset.id)
        db.session.add(scan_event)
        db.session.commit()

        brand_id = g.current_brand.id
        total_scans = db.session.query(db.func.sum(Asset.scan_count)).filter(Asset.brand_id == brand_id).scalar() or 0
        total_products = Product.query.join(Asset).filter(Asset.brand_id == brand_id).count()
        total_assets = Asset.query.filter_by(brand_id=brand_id).count()

        scan_history = db.session.query(
            db.func.date(ScanEvent.timestamp).label('scan_date'),
            db.func.count(ScanEvent.id).label('scan_count')
        ).join(Asset).filter(Asset.brand_id == brand_id).group_by('scan_date').order_by('scan_date').limit(14).all()

        dates = [row.scan_date for row in scan_history]
        counts = [row.scan_count for row in scan_history]
        if not dates:
            dates = [datetime.utcnow().strftime('%Y-%m-%d')]
            counts = [0]

        return jsonify({
            "success": True,
            "asset_id": asset.id,
            "asset_scan_count": asset.scan_count,
            "total_scans": total_scans,
            "total_products": total_products,
            "total_assets": total_assets,
            "chart_dates": dates,
            "chart_counts": counts,
        })
    except Exception as e:
        db.session.rollback()
        return jsonify({"success": False, "error": str(e)}), 500


@app.route('/api/assets/<int:asset_id>/regenerate-qr', methods=['POST'])
@token_required
def api_regenerate_qr(asset_id):
    """Regenerate QR code for an asset with an optional custom host URL."""
    asset = Asset.query.get_or_404(asset_id)
    if asset.brand_id != g.current_brand.id:
        return jsonify({"error": "You do not have permission to regenerate QR for this asset."}), 403

    data = request.get_json() or {}
    custom_host = data.get('host_url') or os.environ.get('FRONTEND_URL') or request.host_url

    try:
        qr_filename = generate_qr_code(asset.id, custom_host)
        asset.qr_code = qr_filename
        db.session.commit()
        return jsonify({
            "success": True,
            "qr_code_url": f"/static/qr_codes/{qr_filename}",
            "target_url": f"{custom_host.rstrip('/')}/asset/{asset.id}"
        })
    except Exception as e:
        db.session.rollback()
        return jsonify({"success": False, "error": str(e)}), 500


@app.route('/api/products', methods=['POST'])
@token_required
def api_create_product():
    """Create a product and link it to a retail asset. Accepts multipart/form-data."""
    product_name = request.form.get('name', '').strip()
    description = request.form.get('description', '').strip()
    price_str = request.form.get('price', '').strip()
    asset_id = request.form.get('asset_id')

    if not product_name or not price_str or not asset_id:
        return jsonify({"error": "name, price, and asset_id are required."}), 400

    target_asset = Asset.query.get(asset_id)
    if not target_asset:
        return jsonify({"error": "Asset not found."}), 404

    if target_asset.brand_id != g.current_brand.id:
        return jsonify({"error": "You do not have permission to add products to this asset."}), 403

    try:
        price = float(price_str)
        if price < 0:
            raise ValueError("Price cannot be negative.")
    except ValueError as ve:
        return jsonify({"error": str(ve)}), 400

    image_filename = None
    file = request.files.get('image')
    if file and file.filename:
        if allowed_file(file.filename):
            unique_prefix = uuid.uuid4().hex[:8]
            image_filename = f"{unique_prefix}_{secure_filename(file.filename)}"
            file.save(os.path.join(app.config['UPLOAD_FOLDER'], image_filename))
        else:
            return jsonify({"error": "Invalid image format."}), 400

    try:
        new_product = Product(
            asset_id=int(asset_id),
            name=product_name,
            description=description,
            price=price,
            image=image_filename
        )
        db.session.add(new_product)
        db.session.commit()
        return jsonify(product_to_dict(new_product)), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@app.route('/api/products/<int:product_id>', methods=['GET'])
def api_get_product(product_id):
    """Get a single product by ID."""
    product = Product.query.get_or_404(product_id)
    return jsonify(product_to_dict(product))


@app.route('/api/products/<int:product_id>', methods=['DELETE'])
@token_required
def api_delete_product(product_id):
    """Delete a product."""
    product = Product.query.get_or_404(product_id)
    if product.asset.brand_id != g.current_brand.id:
        return jsonify({"error": "You do not have permission to delete this product."}), 403
    try:
        if product.image and not product.image.startswith("seed_product_"):
            try:
                os.remove(os.path.join(app.config['UPLOAD_FOLDER'], product.image))
            except OSError:
                pass
        db.session.delete(product)
        db.session.commit()
        return jsonify({"success": True, "message": "Product deleted."})
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@app.route('/api/regenerate-all-qrs', methods=['POST'])
@token_required
def api_regenerate_all_qrs():
    """Regenerate QR codes for every asset of this brand using a given host URL."""
    data = request.get_json() or {}
    host_url = data.get('host_url') or os.environ.get('FRONTEND_URL') or request.host_url
    try:
        assets = Asset.query.filter_by(brand_id=g.current_brand.id).all()
        for asset in assets:
            qr_filename = generate_qr_code(asset.id, host_url)
            asset.qr_code = qr_filename
        db.session.commit()
        return jsonify({"success": True, "regenerated": len(assets)})
    except Exception as e:
        db.session.rollback()
        return jsonify({"success": False, "error": str(e)}), 500


# ─────────────────────────────────────────────────────────────────────────────
# Legacy Jinja2 routes kept for backward compatibility
# ─────────────────────────────────────────────────────────────────────────────

@app.route('/')
def home():
    return redirect(url_for('dashboard'))

@app.route('/dashboard')
def dashboard():
    assets = Asset.query.all()
    total_assets = len(assets)
    total_products = Product.query.count()
    total_scans = db.session.query(db.func.sum(Asset.scan_count)).scalar() or 0
    scan_history = db.session.query(
        db.func.date(ScanEvent.timestamp).label('scan_date'),
        db.func.count(ScanEvent.id).label('scan_count')
    ).group_by('scan_date').order_by('scan_date').limit(10).all()
    dates = [row.scan_date for row in scan_history]
    counts = [row.scan_count for row in scan_history]
    if not dates:
        dates = [datetime.utcnow().strftime('%Y-%m-%d')]
        counts = [0]
    return render_template('dashboard.html', assets=assets,
        total_assets=total_assets, total_products=total_products,
        total_scans=total_scans, analytics_dates=dates, analytics_counts=counts)


# Start application
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
