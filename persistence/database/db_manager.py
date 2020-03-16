from datetime import datetime

from persistence.model.movement import Movement, movements_schema
from persistence.model.account_store import User, users_schema, Store
from persistence.model.category import Category, categories_schema
from persistence.model.company import Company, companies_schema
from persistence.model.item import Item, items_schema, Batch


def create_empty_db():
    tom = User(name="Tom", surname="Maz", email="t.maz@mend.it",
               password="sticaz")
    gino = User(name="Gino", surname="Pomicino",
                email="g.pom@oper.it", password="gauz")

    mol1 = Store(name="Bio Mol 1", description="La desscrizione di mol1")
    mol2 = Store(name="Bio Mol 2", description="La desscrizione di mol2")
    mol3 = Store(name="Bio Mol 3", description="La desscrizione di mol3")

    gino.operator_of.append(mol1)
    tom.administrator_of.append(mol1)
    tom.administrator_of.append(mol2)
    tom.operator_of.append(mol2)
    gino.administrator:of.append(mol3)

    cat = Category(name="guanti")
    com1 = Company(name="Occhi spa")
    bat1 = Batch(code="batch1", date_expiry=datetime.strptime(
        '13/02/2020', '%d/%m/%Y'))
    ite1 = Item(code_item='icode_1', name='siringhetta')
    ite1.batches = [bat1]
    ite1.category = cat
    ite1.company = com1

    mov1 = Movement(item=ite1, date_movement=datetime.today(), quantity=2)
    mov1.operator = gino
    mov1.category = cat
    mov1.company = com1
    mov1.batch = bat1

    return [mol1, mol2, mol3, mov1, ite1]


def load_whole_db():
    # rs = Movement.query.join(Company, Movement.company_id == Company.id).all()
    rs = Movement.query.all()
    output = movements_schema.dump(rs)
    # dic_flattened = (flatten(d) for d in output)
    # print(list(dic_flattened))

    formatted_output = [
        {
            'id': d['id'],
            'date_movement':d['date_movement'],
            'operator': d['operator']['name'] + " " + d['operator']['surname'],
            'code_item': d['item']['code_item'],
            'category': d['item']['category']['name'],
            'batches': d['batch']['code'],
            'batches_expiry': d['batch']['date_expiry'],
            'company': d['item']['company']['name'],
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


def load_companies_per_category(category):
    items = Item.query.all()
    company_names = []

    for item in items:
        if item.category.name == category:
            company_names.append(item.company.name)

    return {'companies': list(set(company_names))}


def load_items_per_companies_and_category(category: str, company: str):
    # rs = Movement.query.filter_by(
    #     category=category).with_entities(Movement.item).distinct()

    # rs = Movement.query.filter_by(category ==

    items = Item.query.all()
    item_names = []

    for item in items:
        if item.category.name == category and item.company.name == company:
            item_names.append((item.code_item, item.name))

    return {'items': item_names}


def load_batches_per_item(item_code: str):
    items = Item.query.all()
    batches = []

    for i in items:
        if i.code_item == item_code:
            batches.extend([b.code for b in i.batches])
            break

    return {'batches': batches}


def add_movement(code_item, operator, date_movement, batch, quantity):
    oper = User.query.filter_by(name="Gino", surname="Pomicino").first()
    item = Item.query.filter_by(code_item=code_item).first()
    batc = Batch.query.filter_by(code=batch).first()
    print(batch)
    
    addedData = Movement(
        date_movement=date_movement,
        quantity=quantity,
        operator=oper,
        item=item,
        batch=batc
    )

    return addedData


def delete_movement(delete_id):
    Movement.query.filter_by(id=delete_id).delete()


def edit_movement(movement_id, date, operator, quantity):
    move = Movement.query.filter_by(id=movement_id).first()
    move.date_movement = date
    move.quantity = quantity

    if move.operator != operator:
        name_surname = operator.split(" ")
        user = User.query.filter_by(
            name=name_surname[0], surname=name_surname[1]).first()
        move.operator = user

    return move


def do_login(email, password):
    return User.query.filter_by(email=email, password=password).first()
   