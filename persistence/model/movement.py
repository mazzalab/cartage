from persistence.model import db, ma
from persistence.model.account_store import User, UserSchema
from persistence.model.item import Item, ItemSchema, Batch, BatchSchema


class Movement(db.Model):
    __tablename__ = "movement"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    date_movement = db.Column(db.Date, nullable=False)
    quantity = db.Column(db.Integer, nullable=False)

    # , uselist=False)
    item_id = db.Column(db.Integer, db.ForeignKey('item.id'))
    item = db.relationship("Item", backref=db.backref("movements"))
    batch_id = db.Column(db.Integer, db.ForeignKey('batch.id'))
    batch = db.relationship("Batch", backref=db.backref("movements"))
    operator_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    operator = db.relationship("User", backref=db.backref("movements"))

    def __repr__(self):
        return '[Movement]: id: {}, batch; {}, date: {}, quantity: {}'.format(self.item_id, self.batch_id, self.date_movement, self.quantity)


class MovementSchema(ma.ModelSchema):
    class Meta:
        model = Movement

    item = ma.Nested(ItemSchema)
    batch = ma.Nested(BatchSchema)
    operator = ma.Nested(UserSchema)


movement_schema = MovementSchema()
movements_schema = MovementSchema(many=True)
