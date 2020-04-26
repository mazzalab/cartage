from persistence.model import db, ma
from persistence.model.account_store import Store, StoreSchema
from persistence.model.company import Company, CompanySchema
from persistence.model.category import Category, CategorySchema


map_item_table = db.Table('item_store_map', db.metadata,
                              db.Column('item_id', db.Integer,
                                        db.ForeignKey('item.id')),
                              db.Column('store_id', db.Integer,
                                        db.ForeignKey('store.id'))
                              )


class Batch(db.Model):
    __tablename__ = "batch"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    code = db.Column(db.String(50), nullable=False)
    date_expiry = db.Column(db.Date, nullable=False)
    date_notification = db.Column(db.Date, nullable=False)
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
    __table_args__ = tuple(db.UniqueConstraint('name', 'stored_in'), )

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    code_item = db.Column(db.String(50), nullable=False)
    name = db.Column(db.String(50), nullable=False)
    quantity_notification = db.Column(db.Integer, nullable=False)
    
    batches = db.relationship("Batch", backref=db.backref("item"))
    company_id = db.Column(db.Integer, db.ForeignKey('company.id'))
    company = db.relationship("Company", backref=db.backref("item"))
    category_id = db.Column(db.Integer, db.ForeignKey('category.id'))
    category = db.relationship("Category", backref=db.backref("item"))

    stored_in = db.relationship(
        "Store", secondary=map_item_table, backref="item_stores")
    
    def __repr__(self):
        return '[Item]: {} (code: {}, company: {}, category: {}, batches: {}, stores: {})'.format(
            self.name, self.code_item, self.company.name, self.category.name, self.batches, self.stored_in)


class ItemSchema(ma.ModelSchema):
    class Meta:
        model = Item
    batches = ma.Nested(BatchSchema, many=True)
    company = ma.Nested(CompanySchema)
    category = ma.Nested(CategorySchema)
    store = ma.Nested(StoreSchema, many=True)

item_schema = ItemSchema()
items_schema = ItemSchema(many=True)
