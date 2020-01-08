from model.store import Product
from model.store import db


def load_whole_db():
    return Product.query.all()

def load_all_categories():
    return Product.query.with_entities(Product.category).distinct()

def load_all_companies():
    return Product.query.with_entities(Product.company).distinct()

def load_all_operators():
    return Product.query.with_entities(Product.operator).distinct()

def load_items_per_category(category):
    return Product.query.filter_by(category=category).with_entities(Product.item).distinct()

def delete_movement(delete_id):
    Product.query.filter_by(id=delete_id).delete()
    db.session.commit()

def add_movement(code_item, operator, date_movement, item, category, batch, expiry_date_batch, company, quantity):
    addedData = Product(
        code_item=code_item,
        operator=operator,
        date_movement=date_movement,
        item=item,
        category=category,
        batch=batch,
        expiry_date_batch=expiry_date_batch, 
        company=company,
        quantity=quantity
    )

    db.session.add(addedData)
    db.session.commit()
    db.session.refresh(addedData)
    return addedData.id
