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
from model.db_manager import load_all_db, load_all_categoria, load_all_ditta, load_all_operatore, load_articoli_per_categoria


app = Flask(__name__)

cors = CORS(app)
db.init_app(app)
ma.init_app(app)

app.config.from_object(config_by_name['dev'])
app.config['CORS_HEADERS'] = 'Content-Type'

# flask_bcrypt = Bcrypt()


@app.route('/')
def retrieve_all_data():
    res = load_all_db()
    output = products_schema.dump(res)
    return jsonify(output)


@app.route('/categorie')
def retrieve_all_categoria():
    res = load_all_categoria()
    output = products_schema.dump(res)
    return jsonify(output)


@app.route('/ditte')
def retrieve_all_ditta():
    res = load_all_ditta()
    output = products_schema.dump(res)
    return jsonify(output)


@app.route('/operatori')
def retrieve_all_operatore():
    res = load_all_operatore()
    output = products_schema.dump(res)
    return jsonify(output)


@app.route('/addMovement', methods=['POST'])
def addMovement():
    json_data = request.get_json()

    addedData = Product(
        code=json_data.get('productid')['productid'],
        operatore=json_data.get('operatore')['operatore'],
        # data_evento=datetime.datetime.strptime(json_data.get('dataevento')['dataevento'], "%Y-%m-%d"),
        data_evento=datetime.datetime.strptime(json_data.get('dataevento')['dataevento'], "%Y-%m-%d"),
        articolo=json_data.get('articolo')['articolo'],
        categoria=json_data.get('categoria')['categoria'],
        lotto=json_data.get('lotto')['lotto'],
        ditta=json_data.get('ditta')['ditta'],
        quantita=int(json_data.get('quantita')['quantita'])
    )
    db.session.add(addedData)
    db.session.commit()
    db.session.refresh(addedData)
    return {'ID': addedData.id}

@app.route('/articoliPerCategoria', methods=['POST'])
def retrieveArticoliPerCategoria():
    json_data = request.get_json()
    categoria=json_data.get('selectedCat')['categoria']

    res = load_articoli_per_categoria(categoria)
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
