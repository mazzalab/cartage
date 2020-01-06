from model.store import Product
from model.store import db


def load_all_db():
    return Product.query.all()

def load_all_categoria():
    return Product.query.with_entities(Product.categoria).distinct()

def load_all_ditta():
    return Product.query.with_entities(Product.ditta).distinct()

def load_all_operatore():
    return Product.query.with_entities(Product.operatore).distinct()

def load_articoli_per_categoria(categoria):
    return Product.query.filter_by(categoria=categoria).with_entities(Product.articolo).distinct()

def delete_movement(delete_id):
    Product.query.filter_by(id=delete_id).delete()
    db.session.commit()

def add_movement(code, operatore, data_evento, articolo, categoria, lotto, ditta, quantita):
    addedData = Product(
        code=code,
        operatore=operatore,
        data_evento=data_evento,
        articolo=articolo,
        categoria=categoria,
        lotto=lotto,
        ditta=ditta,
        quantita=quantita
    )

    db.session.add(addedData)
    db.session.commit()
    db.session.refresh(addedData)
    return addedData.id
