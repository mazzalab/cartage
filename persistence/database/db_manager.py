from datetime import datetime

from persistence.model.movement import Movement, movements_schema
from persistence.model.account_store import User, users_schema, Store
from persistence.model.category import Category, categories_schema
from persistence.model.company import Company, companies_schema
from persistence.model.item import Item, items_schema, Batch


def create_empty_db():
    tom = User(name="Tom", surname="Maz", email="t.maz@mend.it",
               password="sticaz", master=True)
    gino = User(name="Gino", surname="Pomicino",
                email="g.pom@oper.it", password="gauz", master=False)

    mol1 = Store(name="Bio Mol 1", description="La desscrizione di mol1")
    mol2 = Store(name="Bio Mol 2", description="La desscrizione di mol2")
    mol3 = Store(name="Bio Mol 3", description="La desscrizione di mol3")

    mol1.operators.append(gino)
    mol1.administrators.append(tom)
    mol2.administrators.append(tom)
    mol2.operators.append(tom)
    mol3.administrators.append(gino)

    cat = Category(name="guanti")
    com1 = Company(name="Occhi spa")
    bat1 = Batch(code="batch1", date_expiry=datetime.strptime(
        '13/02/2020', '%d/%m/%Y').date())
    ite1 = Item(code_item='icode_1', name='siringhetta')
    ite1.batches = [bat1]
    
    mov1 = Movement(item=ite1, date_movement=datetime.today(), quantity=2)
    mov1.operator = gino
    mov1.category = cat
    mov1.company = com1

    return [mol1, mol2, mol3, mov1, ite1]


def load_whole_db():
    # rs = Movement.query.join(Company, Movement.company_id == Company.id).all()
    rs = Movement.query.all()
    output = movements_schema.dump(rs)
    # dic_flattened = (flatten(d) for d in output)
    # print(list(dic_flattened))

    formatted_output = [
        {
            'id':d['id'], 
            'date_movement':d['date_movement'],
            'operator': d['operator']['name'] + " " + d['operator']['surname'],
            'code_item': d['item']['code_item'],
            'category': d['category']['name'],
            'batches': d['item']['batches'][0]['code'],
            'batches_expiry': d['item']['batches'][0]['date_expiry'],
            'company': d['company']['name'],
            'item': d['item']['name'],
            'quantity': d['quantity']
        } for d in output]
    
    return list(formatted_output)


def load_all_categories():
    rs = Category.query.all()
    # rs = Movement.query.with_entities(Movement.category).distinct()
    output = categories_schema.dump(rs)
    return output


def load_all_companies():
    # rs = Movement.query.with_entities(Movement.company).distinct()
    rs = Company.query.all()
    output = companies_schema.dump(rs)
    return output


def load_all_operators():
    # rs = Movement.query.with_entities(Movement.operator).distinct()
    rs = User.query.with_entities(User.id, User.name, User.surname)
    output = users_schema.dump(rs)
    return output


def load_items_per_category(category):
    rs = Movement.query.filter_by(
        category=category).with_entities(Movement.item).distinct()
    output = movements_schema.dump(rs)
    return output


def add_movement(code_item, operator, date_movement, item, category, batch, expiry_date_batch, company, quantity):
    addedData = Movement(
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

    return addedData


def delete_movement(delete_id):
    Movement.query.filter_by(id=delete_id).delete()
