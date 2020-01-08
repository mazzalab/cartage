from flask_sqlalchemy import SQLAlchemy
from flask_marshmallow import Marshmallow

db = SQLAlchemy()
ma = Marshmallow()

class Product(db.Model):
    """ Product Model for storing product related details """
    __tablename__ = "store"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    code_item = db.Column(db.String(50), nullable=False)
    operator = db.Column(db.String(255), nullable=False)
    date_movement = db.Column(db.Date, nullable=False)
    quantity = db.Column(db.Integer, nullable=False)
    category = db.Column(db.String(100), nullable=False)
    item = db.Column(db.String(300), nullable=False)
    batch = db.Column(db.String(100), nullable=True)
    expiry_date_batch = db.Column(db.Date, nullable=True)
    company = db.Column(db.String(100), nullable=False)  # , default=False

    def __repr__(self):
        return '[{}]: {}'.format(self.category, self.item)

class ProductSchema(ma.ModelSchema):
    class Meta:
        # fields = ('id','operator', ... ,'company')
        model = Product

product_schema = ProductSchema()
products_schema = ProductSchema(many=True)
