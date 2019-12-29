from model.store import Product
import sys


def load_all_db():
    return Product.query.all()


def load_all_categoria():
    query = Product.query.filter_by(categoria='guanti').first()
    
    # query = Product.query.with_entities(Product.categoria).distinct()
    print(query, file=sys.stderr)

    return query

def load_all_ditta():
    return Product.query.with_entities(Product.ditta).distinct()
