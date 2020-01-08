import datetime
import argparse

from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS, cross_origin
# from flask_bcrypt import Bcrypt

from config import config_by_name
from model.store import Product
from model.store import db
from model.store import ma
from model.store import products_schema, product_schema
from model.account import Store, User
import model.db_manager


app = Flask(__name__)

cors = CORS(app)
db.init_app(app)
ma.init_app(app)

app.config.from_object(config_by_name['dev'])
app.config['CORS_HEADERS'] = 'Content-Type'

# flask_bcrypt = Bcrypt()


@app.route('/')
def retrieve_all_data():
    res = model.db_manager.load_whole_db()
    output = products_schema.dump(res)
    return jsonify(output)


@app.route('/categories')
def retrieve_all_categories():
    res = model.db_manager.load_all_categories()
    output = products_schema.dump(res)
    return jsonify(output)


@app.route('/companies')
def retrieve_all_companies():
    res = model.db_manager.load_all_companies()
    output = products_schema.dump(res)
    return jsonify(output)


@app.route('/operators')
def retrieve_all_operators():
    res = model.db_manager.load_all_operators()
    output = products_schema.dump(res)
    return jsonify(output)

@app.route('/add_movement', methods=['POST'])
def addMovement():
    json_data = request.get_json()
    addedDataId = model.db_manager.add_movement(
        json_data.get('code_item')['code_item'],
        json_data.get('operator')['operator'],
        datetime.datetime.strptime(json_data.get('date_movement')['date_movement'], "%Y-%m-%d"),
        json_data.get('item')['item'],
        json_data.get('category')['category'],
        json_data.get('batch')['batch'],
        json_data.get('company')['company'],
        int(json_data.get('quantity')['quantity'])
    )

    return {'ID': addedDataId}

@app.route('/delete_movement', methods=['POST'])
def deleteMovement():
    json_data = request.get_json()
    delete_id = json_data.get('movement_id_obj')['id']
    model.db_manager.delete_movement(delete_id)
    return {'ID': delete_id}

@app.route('/items_per_category', methods=['POST'])
def retrieveArticoliPerCategoria():
    json_data = request.get_json()
    categoria=json_data.get('selected_category')['category']

    res = model.db_manager.load_items_per_category(categoria)
    output = products_schema.dump(res)
    return jsonify(output)



if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument('-l', '--load', action='store_true',
                        help="create and load db")
    parser.add_argument('-r', '--run', action='store_true',
                        help="run the cartage application")
    args = parser.parse_args()

    if args.load:
        with app.app_context():
            db.create_all()
            # first = Product(code_item="234kj2t", operator="MCD", date_event=datetime.date.today(), quantity=2, category="guanti",
            #                 item="naso", batch="23j23", company="agattaditta")
            # second = Product(code="1111", operatore="Tom", data_evento=datetime.date.today(), quantita=0, categoria="puntali",
            #                  articolo="bocca", lotto="1bis", ditta="divo")
            # third = Product(code="ABA222", operatore="MCD", data_evento=datetime.date.today(), quantita=4, categoria="fogli",
            #                 articolo="orecchie", lotto="183e", ditta="sillino")
            # fourth = Product(code="ABA222", operatore="PIP", data_evento=datetime.date.today(), quantita=1, categoria="fogli",
            #                  articolo="orecchie", lotto="183T", ditta="sillino")
            # db.session.add(first)
            # db.session.add(second)
            # db.session.add(third)
            # db.session.add(fourth)

            tom = User(name="Tom", surname="Maz", email="t.maz@mend.it", password="sticaz", master=True)
            gino = User(name="Gino", surname="Pomicino", email="g.pom@oper.it", password="gauz", master=False)

            mol1 = Store(name="Bio Mol 1", description="La desscrizione di mol1")
            mol2 = Store(name="Bio Mol 2", description="La desscrizione di mol2")
            mol3 = Store(name="Bio Mol 3", description="La desscrizione di mol3")

            mol1.operators.append(gino)
            mol1.administrators.append(tom)
            mol2.administrators.append(tom)
            mol2.operators.append(tom)
            mol3.administrators.append(gino)

            db.session.add(tom)
            db.session.add(gino)
            db.session.commit()

            # flask_bcrypt.init_app(app)
    else:
        app.run()
