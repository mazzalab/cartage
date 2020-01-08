from flask_sqlalchemy import SQLAlchemy
from flask_marshmallow import Marshmallow

db = SQLAlchemy()
ma = Marshmallow()

class Batch(db.Model):
    """ Product Model for storing product related details """
    __tablename__ = "batch"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    # code_item = db.Column(db.String(50), nullable=False)
    # operator = db.Column(db.String(255), nullable=False)
    # date_movement = db.Column(db.Date, nullable=False)
    # quantity = db.Column(db.Integer, nullable=False)
    # category = db.Column(db.String(100), nullable=False)
    # item = db.Column(db.String(300), nullable=False)
    # batch = db.Column(db.String(100), nullable=True)
    # expiry_date_batch = db.Column(db.Date, nullable=True)
    # company = db.Column(db.String(100), nullable=False)  # , default=False

    def __repr__(self):
        return '[{}]: {}'.format(self.category, self.item)

class BatchSchema(ma.ModelSchema):
    class Meta:
        model = Batch

batch_schema = BatchSchema()
batches_schema = BatchSchema(many=True)