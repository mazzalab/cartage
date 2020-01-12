from persistence.model import db, ma

class Company(db.Model):
    __tablename__ = "company"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(50), nullable=False)

    def __repr__(self):
        return '[Company]: {}'.format(self.name)

class CompanySchema(ma.ModelSchema):
    class Meta:
        fields = ('id','name')
        model = Company

company_schema = CompanySchema()
companies_schema = CompanySchema(many=True)