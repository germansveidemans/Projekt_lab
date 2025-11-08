from flask import Flask

def create_app():
    app = Flask(__name__)
    app.config["JSON_AS_ASCII"] = False

    # Blueprints
    from app.controller.UserController import users_bp
    from app.controller.Work_areaController import work_areas_bp
    from app.controller.CarController import cars_bp
    from app.controller.ClientControler import clients_bp
    from app.controller.RouteController import routes_bp
    from app.controller.OrderControler import orders_bp

    app.register_blueprint(users_bp, url_prefix="/users")
    app.register_blueprint(work_areas_bp, url_prefix="/work-areas")
    app.register_blueprint(cars_bp, url_prefix="/cars")
    app.register_blueprint(clients_bp, url_prefix="/clients")
    app.register_blueprint(routes_bp, url_prefix="/routes")
    app.register_blueprint(orders_bp, url_prefix="/orders")
    return app

