from persistence.model import db, ma

map_operator_table = db.Table('operator_store_map', db.metadata,
    db.Column('user_id', db.Integer, db.ForeignKey('user.id')),
    db.Column('store_id', db.Integer, db.ForeignKey('store.id'))
)

map_admin_table = db.Table('admin_store_map', db.metadata,
    db.Column('user_id', db.Integer, db.ForeignKey('user.id')),
    db.Column('store_id', db.Integer, db.ForeignKey('store.id'))
)   

class User(db.Model):
    __tablename__ = "user"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(50), nullable=False)
    surname = db.Column(db.String(50), nullable=False)
    email = db.Column(db.String(50), nullable=False, unique=True)
    password = db.Column(db.String(50), nullable=False)
    master = db.Column(db.Boolean, nullable=False, default=False)

    def __repr__(self):
        return '[User]: name={} surname={}'.format(self.name, self.surname)

class UserSchema(ma.ModelSchema):
    class Meta:
        model = User

user_schema = UserSchema()
users_schema = UserSchema(many=True)


class Store(db.Model):
    __tablename__ = "store"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(50), nullable=False)
    description = db.Column(db.String(150), nullable=True)
    operators = db.relationship("User", secondary=map_operator_table, backref="operator_stores")
    administrators = db.relationship("User", secondary=map_admin_table, backref="administrator_stores")

class StoreSchema(ma.ModelSchema):
    class Meta:
        model = Store

store_schema = StoreSchema()
stores_schema = StoreSchema(many=True)
