from app import db
from sqlalchemy import Enum
from sqlalchemy.sql import func

RouteStatus = Enum("izskatīšana", "atdots kurjeram", name="route_status")

class Route(db.Model):
    __tablename__ = "routes"

    id = db.Column(db.Integer, primary_key=True)
    courier_id = db.Column(db.Integer, db.ForeignKey('user.id', ondelete='SET NULL'), index=True)
    work_time = db.Column(db.Integer)
    date = db.Column(db.Date, index=True)
    total_orders = db.Column(db.Integer, default=0)
    total_distance = db.Column(db.Numeric(10,2))
    optimized_path = db.Column(db.JSON)
    status = db.Column(RouteStatus, nullable=False, server_default="planned", index = True)

    courier = db.relationship("user", back_populates="route")
    orders = db.relationship("Order", back_populates="route", cascade="all, delete-orphan")

    def __repr__(self):
        return (f"<Route id = {self.id} courier_id = {self.courier_id} date = {self.date} total_orders = {self.total_orders}"
                f"status = {self.status}>") % self.courier


