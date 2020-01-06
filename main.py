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
    res = model.db_manager.load_all_db()
    output = products_schema.dump(res)
    return jsonify(output)


@app.route('/categorie')
def retrieve_all_categoria():
    res = model.db_manager.load_all_categoria()
    output = products_schema.dump(res)
    return jsonify(output)


@app.route('/ditte')
def retrieve_all_ditta():
    res = model.db_manager.load_all_ditta()
    output = products_schema.dump(res)
    return jsonify(output)


@app.route('/operatori')
def retrieve_all_operatore():
    res = model.db_manager.load_all_operatore()
    output = products_schema.dump(res)
    return jsonify(output)

@app.route('/addMovement', methods=['POST'])
def addMovement():
    json_data = request.get_json()
    addedDataId = model.db_manager.add_movement(
        json_data.get('productid')['productid'],
        json_data.get('operatore')['operatore'],
        datetime.datetime.strptime(json_data.get('dataevento')['dataevento'], "%Y-%m-%d"),
        json_data.get('articolo')['articolo'],
        json_data.get('categoria')['categoria'],
        json_data.get('lotto')['lotto'],
        json_data.get('ditta')['ditta'],
        int(json_data.get('quantita')['quantita'])
    )

    return {'ID': addedDataId}

@app.route('/deleteMovement', methods=['POST'])
def deleteMovement():
    json_data = request.get_json()
    delete_id = json_data.get('eid_obj')['id']
    model.db_manager.delete_movement(delete_id)
    return {'ID': delete_id}

@app.route('/articoliPerCategoria', methods=['POST'])
def retrieveArticoliPerCategoria():
    json_data = request.get_json()
    categoria=json_data.get('selectedCat')['categoria']

    res = model.db_manager.load_articoli_per_categoria(categoria)
    output = products_schema.dump(res)
    return jsonify(output)



if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument('-l', '--load', action='store_true',
                        help="create and load db")
    parser.add_argument('-r', '--run', action='store_true',
                        help="run the cartage")
    args = parser.parse_args()

    if args.load:
        with app.app_context():
            db.create_all()
            first = Product(code="234kj2t", operatore="MCD", data_evento=datetime.date.today(), quantita=2, categoria="guanti",
                            articolo="naso", lotto="23j23", ditta="agattaditta")
            second = Product(code="1111", operatore="Tom", data_evento=datetime.date.today(), quantita=0, categoria="puntali",
                             articolo="bocca", lotto="1bis", ditta="divo")
            third = Product(code="ABA222", operatore="MCD", data_evento=datetime.date.today(), quantita=4, categoria="fogli",
                            articolo="orecchie", lotto="183e", ditta="sillino")
            fourth = Product(code="ABA222", operatore="PIP", data_evento=datetime.date.today(), quantita=1, categoria="fogli",
                             articolo="orecchie", lotto="183T", ditta="sillino")
            db.session.add(first)
            db.session.add(second)
            db.session.add(third)
            db.session.add(fourth)

            db.session.commit()

            # flask_bcrypt.init_app(app)
    else:
        app.run()
