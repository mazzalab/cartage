from persistence.model import db, ma


class Batch(db.Model):
    __tablename__ = "batch"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    code = db.Column(db.String(50), nullable=False)
    date_expiry = db.Column(db.Date, nullable=False)
    item_id = db.Column(db.Integer, db.ForeignKey('item.id'))
    
    def __repr__(self):
        return '[Batch]: {} (expiry date: {})'.format(self.code, self.date_expiry)


class BatchSchema(ma.ModelSchema):
    class Meta:
        model = Batch

batch_schema = BatchSchema()
batches_schema = BatchSchema(many=True)


class Item(db.Model):
    __tablename__ = "item"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    code_item = db.Column(db.String(50), nullable=False)
    name = db.Column(db.String(50), nullable=False)
    batches = db.relationship("Batch", backref=db.backref("item"))
    
    def __repr__(self):
        return '[Item]: {} (code: {})'.format(self.name, self.code_item)


class ItemSchema(ma.ModelSchema):
    class Meta:
        model = Item
    batches = ma.Nested(BatchSchema, many=True)

item_schema = ItemSchema()
items_schema = ItemSchema(many=True)
