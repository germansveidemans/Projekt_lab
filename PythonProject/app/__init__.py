from flask import Flask
from app.config import Config
from app.db import init_pool, close_connection
from app.controllers.UserController import user_bp
from app.controllers.CarController import car_bp
from app.controllers.ClientControler import client_bp
from app.controllers.OrderControler import order_bp
from app.controllers.RouteController import route_bp
from app.controllers.Work_areaController import work_area_bp
from app.controllers.page_controller import page_bp


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    init_pool(app)

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
    app.register_blueprint(page_bp)

    return app

