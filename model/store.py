from flask_sqlalchemy import SQLAlchemy
from flask_marshmallow import Marshmallow

db = SQLAlchemy()
ma = Marshmallow()

class Product(db.Model):
    """ Product Model for storing product related details """
    __tablename__ = "store"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    code = db.Column(db.String(50), nullable=False)
    operatore = db.Column(db.String(255), nullable=False)
    data_evento = db.Column(db.Date, nullable=False)
    quantita = db.Column(db.Integer, nullable=False)
    categoria = db.Column(db.String(100), nullable=False)
    # codice_articolo = db.Column(db.String(50), nullable=False, unique=True)
    articolo = db.Column(db.String(300), nullable=False)
    lotto = db.Column(db.String(100), nullable=False)
    ditta = db.Column(db.String(100), nullable=False)  # , default=False

    def __repr__(self):
        return '[{}]: {}'.format(self.categoria, self.articolo)

class ProductSchema(ma.ModelSchema):
    class Meta:
        # fields = ('id','operatore','data_evento','quantita','categoria','articolo','code','lotto','ditta')
        model = Product

product_schema = ProductSchema()
products_schema = ProductSchema(many=True)
