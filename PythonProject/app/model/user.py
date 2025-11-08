from app import db
from sqlalchemy.sql import func
from sqlalchemy import Enum


UserRole = Enum("admin", "kurjers")

class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    password = db.Column(db.String(50), nullable=False)
    role = db.Column(UserRole, nullable=False)
    work_area_id = db.Column(db.Integer, db.ForeignKey('work_area.id', ondelete='SET NULL'))

    # saites
    work_area = db.relationship("WorkArea", back_populates="users")
    car = db.relationship("Car", back_populates="users", uselist=False)
    routes = db.relationship("Route", back_populates="courier")

    def __repr__(self):
        return f"<User id = {self.id} username = {self.username!r} role = {self.role}>"

    # To_JSON
    def to_dict(self):
        return {
            "id": self.id,
            "username": self.username,
            "role": self.role,
            "work_area_id": self.work_area_id,
        }
