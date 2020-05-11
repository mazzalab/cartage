from datetime import datetime, timedelta
from sqlalchemy.sql.expression import func

from persistence.model.movement import Movement, movements_schema
from persistence.model.account_store import User, users_schema, user_schema, Store, stores_schema, Laboratory
from persistence.model.category import Category, categories_schema
from persistence.model.company import Company, companies_schema
from persistence.model.item import Item, items_schema, Batch, batches_schema


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
    gino.administrator_of.append(mol3)

    cat1 = Category(name="guanti")
    cat2 = Category(name="plastiche")
    com1 = Company(name="Occhi spa")

    bat1 = Batch(code="batch1", date_expiry=datetime.strptime(
        '13/02/2020', '%d/%m/%Y'))
    bat2 = Batch(code="batch2", date_expiry=datetime.strptime(
        '13/04/2020', '%d/%m/%Y'))

    ite1 = Item(code_item='code1', name='siringhetta')
    ite1.batches = [bat1]
    ite1.category = cat2
    ite1.company = com1
    ite1.stored_in.append(mol1)

    ite2 = Item(code_item='code2', name='pipetta')
    ite2.batches = [bat2]
    ite2.category = cat2
    ite2.company = com1
    ite2.stored_in.append(mol1)

    mov1 = Movement(item=ite1, date_movement=datetime.today(), quantity=2)
    mov1.operator = gino
    mov1.category = cat1
    mov1.company = com1
    mov1.batch = bat1

    return [mol1, mol2, mol3, mov1, ite1, ite2]


def load_stores(userid: int):
    rs = User.query.join(Store.Users).filter_by(
        id=userid).with_entities(Store.id, Store.name)
    output = stores_schema.dump(rs)
    return output


def load_user_info(userid: int):
    rs = User.query.filter_by(id=userid).with_entities(
        User.name, User.surname).first()
    output = user_schema.dump(rs)
    return output


def load_categories(storeid: int):
    rs = Store.query.filter_by(id=storeid).join(Item, Store.item_stores).join(
        Category, Category.id == Item.category_id).with_entities(Category.id, Category.name).distinct()
    output = categories_schema.dump(rs)
    return output


def load_companies(categoryid: int, storeid: int):
    rs = Item.query.filter_by(category_id=categoryid).join(Store, Item.stored_in).filter_by(
        id=storeid).with_entities(Company.id, Company.name).distinct(Company.id)
    output = items_schema.dump(rs)
    return output


def load_items(categoryid: int, companyid: int, storeid: int):
    rs = Item.query.filter_by(category_id=categoryid).filter_by(company_id=companyid).join(
        Store, Item.stored_in).filter_by(id=storeid).with_entities(Item.id, Item.name).all()
    output = items_schema.dump(rs)
    return output


def load_batches_per_item(itemid: int, storeid: int):
    rs = Batch.query.join(Item, Batch.item).filter(Item.id == itemid).join(
        Store, Item.stored_in).filter(Store.id == storeid)
    output = batches_schema.dump(rs)
    return output


def load_batches_per_movement(movementid: int):
    mov = Movement.query.filter_by(id=movementid).first()
    rs = Item.query.filter_by(id=mov.item_id).first().batches
    output = batches_schema.dump(rs)
    return output


#######################################################################
# Add, edit and delete movements
def add_movement(date_movement, quantity, operator, item_id, batch_id):
    oper = User.query.filter_by(id=operator).first()
    item = Item.query.filter_by(id=item_id).first()
    batch = Batch.query.filter_by(id=batch_id).first()

    addedMovement = Movement(
        date_movement=date_movement,
        quantity=quantity,
        operator=oper,
        item=item,
        batch=batch
    )

    return addedMovement


def edit_movement(movement_id, date, batch, quantity):
    b = Batch.query.filter_by(code=batch).first()

    move = Movement.query.filter_by(id=movement_id).first()
    move.date_movement = date
    move.quantity = quantity
    move.batch = b

    return move


def delete_movement(delete_id):
    Movement.query.filter_by(id=delete_id).delete()
#######################################################################


def load_movements(storeid: int):
    rs = Movement.query.join(User, Movement.operator).join(
        Store, User.operator_of).filter_by(id=storeid).all()
    output = movements_schema.dump(rs)

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


#######################################################################
# QuickInfoBox component's queries
def load_expiring_by_store(storeid: int):
    rs = Movement.query.join(Item, Item.id == Movement.item_id).join(Store, Item.stored_in).filter(Store.id == storeid).group_by(
        Movement.batch_id).having(func.sum(Movement.quantity) > 0).join(Batch, Batch.id == Movement.batch_id).filter(
        datetime.today() >= Batch.date_notification).with_entities(
        Movement.batch_id,
        Batch.code.label('batch_code'),
        Batch.date_expiry.label('batch_date_expiry'),
        Batch.date_notification.label('batch_date_notification'),
        func.sum(Movement.quantity).label('batch_quantity'),
        Item.id.label('item_id'),
        Item.code_item.label('item_code_item'),
        Item.name.label('item_name'),
        Item.quantity_notification.label('item_quantity_notification')
    ).order_by(Batch.date_expiry.desc())
    foutput = [
        {
            'batch_id': r.batch_id,
            'batch_code': r.batch_code,
            'batch_date_expiry': r.batch_date_expiry,
            'batch_date_notification': r.batch_date_notification,
            'batch_quantity': r.batch_quantity,
            'item_id': r.item_id,
            'item_code_item': r.item_code_item,
            'item_name': r.item_name,
            'item_quantity_notification': r.item_quantity_notification,
        } for r in rs
    ]
    return foutput


def load_runningout_by_store(storeid: int):
    # Get not-expired batches
    sub = Batch.query.filter(datetime.today() < Batch.date_expiry).subquery()
    # Get items not expired and with total quantity (counting all batches) <= a fixed threshold
    rs = Movement.query.join(sub, Movement.batch_id == sub.c.id).join(Item, Item.id == Movement.item_id).group_by(  # isouter=true
        Movement.batch_id).having(func.sum(Movement.quantity) <= Item.quantity_notification).with_entities(
        Item.id.label('item_id'),
        Item.code_item.label('item_code_item'),
        Item.name.label('item_name'),
        Item.quantity_notification.label('item_quantity_notification'),
        sub.c.code.label('batch_code'),
        sub.c.date_expiry.label('batch_date_expiry'),
        sub.c.date_notification.label('batch_date_notification'),
        func.sum(Movement.quantity).label('batch_quantity')).order_by(Item.id, func.sum(Movement.quantity).asc()).distinct().all()
    foutput = [
        {
            'item_id': r.item_id,
            'item_code_item': r.item_code_item,
            'item_name': r.item_name,
            'item_quantity_notification': r.item_quantity_notification,
            'batch_code': r.batch_code,
            'batch_date_expiry': r.batch_date_expiry,
            'batch_date_notification': r.batch_date_notification,
            'batch_quantity': r.batch_quantity
        } for r in rs
    ]
    return foutput
#######################################################################

#######################################################################


def do_login(email, password):
    return User.query.filter_by(email=email, password=password).first()


def load_user_by_email(email: str):
    return User.query.filter_by(email=email).first_or_404()


def load_laboratories():
    return Laboratory.query.with_entities(Laboratory.id, Laboratory.name).all()


def load_lab_head(laboratory_id: int):
    lab = Laboratory.query.filter_by(id=laboratory_id).join(User, User.id == Laboratory.head_id).with_entities(
        User.name.label('head_name'), User.email.label('head_email')).first()
    return (lab.head_name, lab.head_email)
