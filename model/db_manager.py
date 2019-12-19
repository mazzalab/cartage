from model.store import Product

def load_all_db():
    return Product.query.all()
