from app import db
from sqlalchemy import func


class Car(db.Model):
    __tablename__ = "car"

    id = db.Column(db.Integer, primary_key=True)
    size = db.Column(db.Numeric(10,2))
    weight = db.Column(db.Numeric(10,2))
    vehicle_number = db.Column(db.String(7))
    user_id = db.Column(db.Integer, db.ForeignKey("user.id", ondelete = "CASCADE"), unique = True, nullable = False)

    user = db.relationship("User", back_populates="car")

    def __repr__(self):
        return f"<Car id = {self.id} vehicle number = {self.vehicle_number} user id = {self.user_id}>"
