from persistence.model import db, ma
from persistence.model.company import Company, CompanySchema
from persistence.model.category import Category, CategorySchema
from persistence.model.account_store import User, UserSchema
from persistence.model.item import Item, ItemSchema


class Movement(db.Model):
    __tablename__ = "movement"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    date_movement = db.Column(db.Date, nullable=False)
    quantity = db.Column(db.Integer, nullable=False)

    item_id = db.Column(db.Integer, db.ForeignKey('item.id'))  # , uselist=False)
    item = db.relationship("Item", backref=db.backref("movements"))
    operator_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    operator = db.relationship("User", backref=db.backref("movements"))
    company_id = db.Column(db.Integer, db.ForeignKey('company.id'))
    company = db.relationship("Company", backref=db.backref("movements"))
    category_id = db.Column(db.Integer, db.ForeignKey('category.id'))
    category = db.relationship("Category", backref=db.backref("movements"))

    def __repr__(self):
        return '[Movement]: {} (category: {})'.format(self.item, self.category)


class MovementSchema(ma.ModelSchema):
    class Meta:
        model = Movement
    
    company = ma.Nested(CompanySchema)
    item = ma.Nested(ItemSchema)
    operator = ma.Nested(UserSchema)
    category = ma.Nested(CategorySchema)


movement_schema = MovementSchema()
movements_schema = MovementSchema(many=True)
