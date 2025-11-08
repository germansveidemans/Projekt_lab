from app import db
from sqlalchemy import Enum, Index
from sqlalchemy.sql import func

OrderStatus = Enum("gatavs", "progresā", "atcelts", "izskaitīšana")

class Order(db.Model):
    __tablename__ = "orders"

    id = db.Column(db.Integer, primary_key=True)
    route_id = db.Column(db.Integer, db.ForeignKey("route.id", ondelete = "SET NULL"), index=True)
    sequence = db.Column(db.Integer)
    size = db.Column(db.Numeric(10,2))
    weight = db.Column(db.Numeric(5,2))
    client_id = db.Column(db.Integer, db.ForeignKey("client.id", ondelete = "SET NULL"), index=True)
    address = db.Column(db.String(100))
    expected_delivery_time = db.Column(db.DateTime(timezone=True))
    route_status = db.Column(OrderStatus, nullable=False, server_default="rindā", index=True)
    actual_delivery_time = db.Column(db.DateTime(timezone=True))
    created_at = db.Column(db.DateTime(timezone=True), server_default=func.now())
    updated_at = db.Column(db.DateTime(timezone=True), onupdate=func.now())

    route = db.relationship("Route", back_populates="order")
    client = db.relationship("Client", back_populates="order")

    __table_args__ = (
        Index("ux_orders_route_sequence", "route_id", "sequence", unique=True),
    )

    def __repr__(self):
        return (f"<Order id={self.id} route_id={self.route_id} client_id={self.client_id} seq={self.sequence}"
                f"route_status={self.route_status} actual_delivery_time={self.actual_delivery_time}>")

