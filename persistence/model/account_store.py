from persistence.model import db, ma
from flask_security import SQLAlchemyUserDatastore, UserMixin, RoleMixin


db.metadata.clear()

##### MANY-TO-MANY relationships #####
map_operator_table = db.Table('operator_store_map', db.metadata,
                              db.Column('user_id', db.Integer,
                                        db.ForeignKey('user.id')),
                              db.Column('store_id', db.Integer,
                                        db.ForeignKey('store.id'))
                              )

map_admin_table = db.Table('admin_store_map', db.metadata,
                           db.Column('user_id', db.Integer,
                                     db.ForeignKey('user.id')),
                           db.Column('store_id', db.Integer,
                                     db.ForeignKey('store.id'))
                           )

roles_users = db.Table('roles_users',
                       db.Column('user_id', db.Integer(),
                                 db.ForeignKey('user.id')),
                       db.Column('role_id', db.Integer(), db.ForeignKey('role.id')))



####### STORE model ############
class Store(db.Model):
    __tablename__ = "store"
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(50), nullable=False)
    description = db.Column(db.String(150), nullable=True)

class StoreSchema(ma.ModelSchema):
    class Meta:
        model = Store

store_schema = StoreSchema()
stores_schema = StoreSchema(many=True)



####### ROLE model ############
class Role(db.Model, RoleMixin):
    __tablename__ = "role"
    id = db.Column(db.Integer(), primary_key=True)
    name = db.Column(db.String(80), unique=True)
    description = db.Column(db.String(255))

class RoleSchema(ma.ModelSchema):
    class Meta:
        model = Role



####### USER model ############
class User(db.Model, UserMixin):
    __tablename__ = "user"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(50), nullable=False)
    surname = db.Column(db.String(50), nullable=False)
    email = db.Column(db.String(50), nullable=False, unique=True)
    password = db.Column(db.String(50), nullable=False)
    active = db.Column(db.Boolean, default=False)
    confirmed_at = db.Column(db.Date)
    laboratory_id = db.Column(db.Integer, db.ForeignKey('laboratory.id'))
            
    operator_of = db.relationship(
        "Store", secondary=map_operator_table, backref="Users")
    administrator_of = db.relationship(
        "Store", secondary=map_admin_table, backref="Administrators")
    roles = db.relationship('Role', secondary=roles_users,
                            backref=db.backref('users', lazy='dynamic'))

    def __repr__(self):
        return '[User]: name={} surname={}'.format(self.name, self.surname)

class UserSchema(ma.ModelSchema):
    class Meta:
        model = User

user_schema = UserSchema()
users_schema = UserSchema(many=True)



####### LABORATORY model ############
class Laboratory(db.Model):
    __tablename__ = "laboratory"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(50), nullable=False)
    description = db.Column(db.String(250), nullable=True)
    head_id = db.Column(db.Integer, db.ForeignKey('user.id', ondelete='SET NULL'), nullable=True)
    head = db.relationship(
        "User", backref=db.backref("Laboratory_head", passive_deletes=True), foreign_keys=[head_id], uselist=False) 
    members = db.relationship(
        "User", backref=db.backref("Laboratory_members"), foreign_keys=[User.laboratory_id])

    def __repr__(self):
        return '[Laboratory]: {}'.format(self.name)


class LaboratorySchema(ma.ModelSchema):
    class Meta:
        # fields = ('id','name')
        model = Laboratory

laboratory_schema = LaboratorySchema()
laboratories_schema = LaboratorySchema(many=True)



####### Setup Flask-Security #######
user_datastore = SQLAlchemyUserDatastore(db, User, Role)
