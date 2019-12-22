from flask_sqlalchemy import SQLAlchemy
from marshmallow import Schema, fields
from flask_marshmallow import Marshmallow

db = SQLAlchemy()
ma = Marshmallow()

class Product(db.Model):
    """ Product Model for storing product related details """
    __tablename__ = "store"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    operatore = db.Column(db.String(255), nullable=False)
    data_evento = db.Column(db.DateTime, nullable=False)
    quantita = db.Column(db.Integer, nullable=False)
    categoria = db.Column(db.String(100), nullable=False)
    codice_articolo = db.Column(
        db.String(50), nullable=False, default=False, unique=True)
    articolo = db.Column(db.String(300), nullable=False, default=False)
    lotto = db.Column(db.String(100), nullable=False, default=False, unique=True)
    ditta = db.Column(db.String(100), nullable=False, default=False)

    def __repr__(self):
        return '[{}]: {}'.format(self.categoria, self.articolo)

class ProductSchema(ma.Schema):
    class Meta:
        fields = ("id","operatore","data_evento","quantita","categoria","codice_articolo","articolo","lotto","ditta")
        # model = Product
