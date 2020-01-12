from persistence.model import db, ma

class Category(db.Model):
    __tablename__ = "category"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(50), nullable=False, unique=True)
    
    def __repr__(self):
        return '[Category]: {}'.format(self.name)

class CategorySchema(ma.ModelSchema):
    class Meta:
        model = Category

category_schema = CategorySchema()
categories_schema = CategorySchema(many=True)