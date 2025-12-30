from flask import Flask
from app.config import Config
from app.db import init_pool, close_connection
from flask_cors import CORS
from app.controllers.UserController import user_bp
from app.controllers.CarController import car_bp
from app.controllers.ClientControler import client_bp
from app.controllers.OrderControler import order_bp
from app.controllers.RouteController import route_bp
from app.controllers.Work_areaController import work_area_bp
from app.controllers.CourierController import courier_bp


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    init_pool(app)
    app.secret_key = app.config.get("SECRET_KEY", "please_change_me_in_production")
    # Enable CORS for browser-based frontends; tighten origins in production
    try:
        CORS(app)
    except Exception:
        pass
    @app.teardown_appcontext
    def teardown_db(exception):
        close_connection(exception)

    # Blueprints
    app.register_blueprint(user_bp)
    app.register_blueprint(car_bp)
    app.register_blueprint(client_bp)
    app.register_blueprint(order_bp)
    app.register_blueprint(route_bp)
    app.register_blueprint(work_area_bp)
    app.register_blueprint(courier_bp)

    # Optimization endpoints (UI is handled by React frontend)
    try:
        from app.controllers.OptimizationController import opt_bp
        print(f"[OK] OptimizationController imported, registering blueprint...")
        app.register_blueprint(opt_bp)
        print(f"[OK] OptimizationController registered with routes:")
        for rule in app.url_map.iter_rules():
            if 'optimize' in str(rule):
                print(f"     {rule}")
    except Exception as e:
        print(f"[ERROR] Failed to load OptimizationController: {e}")
        import traceback
        traceback.print_exc()

    return app
