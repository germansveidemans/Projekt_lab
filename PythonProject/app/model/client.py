from app import db

class Client(db.Model):
    __tablename__ = 'client'

    id = db.Column(db.Integer, primary_key=True)
    name_surname = db.Column(db.String(50), nullable=False)
    email = db.Column(db.String(100), nullable=False)
    address = db.Column(db.String(100), nullable=False)
    phone_number = db.Column(db.String(12), index = True)

    orders = db.relationship('Order', back_populates='client')

    def __repr__(self):
        return f"<Client id = {self.id} name = {self.name_surname}>"

