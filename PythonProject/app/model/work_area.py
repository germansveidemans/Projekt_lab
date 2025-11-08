from app import db
from sqlalchemy.sql import func


class Work_Area(db.Model):
    __tablename__ = "work_area"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), nullable=False)

    user = db.relationship("User", back_populates="work_area")

    def __repr__(self):
        return f"<Work Area id = {self.id} name = {self.name!r}>"