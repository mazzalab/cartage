from flask_sqlalchemy import SQLAlchemy
from flask_marshmallow import Marshmallow
from sqlalchemy import (
    Column,
    Integer,
    String,
    Boolean,
    ForeignKey,
    Table,
    metadata,
    relationship
)

map_operator_table = Table('operator_store_map', metadata,
    Column('user_id', Integer, ForeignKey('user.id')),
    Column('store_id', Integer, ForeignKey('store.id'))
)

map_admin_table = Table('admin_store_map', metadata,
    Column('user_id', Integer, ForeignKey('user.id')),
    Column('store_id', Integer, ForeignKey('store.id'))
)   

class User(Model):
    __tablename__ = "user"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(50), nullable=False)
    surname = Column(String(50), nullable=False)
    email = Column(String(50), nullable=False)
    password = Column(String(50), nullable=False)
    master = Column(Boolean, nullable=False, default=False)

class UserSchema(ma.ModelSchema):
    class Meta:
        model = User

user_schema = UserSchema()
users_schema = UserSchema(many=True)

class Store(Model):
    __tablename__ = "store"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(50), nullable=False)
    description = Column(String(150), nullable=True)
    operators = relationship("User", secondary=map_operator_table, backref="operator_stores")
    administrators = relationship("User", secondary=map_admin_table, backref="administrator_stores")

class StoreSchema(ma.ModelSchema):
    class Meta:
        model = Store

store_schema = StoreSchema()
stores_schema = StoreSchema(many=True)
