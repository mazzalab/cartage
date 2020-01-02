from model.store import Product
import sys
import json


def load_all_db():
    return Product.query.all()

def load_all_categoria():
    return Product.query.with_entities(Product.categoria).distinct()

def load_all_ditta():
    return Product.query.with_entities(Product.ditta).distinct()

def load_all_operatore():
    return Product.query.with_entities(Product.operatore).distinct()
