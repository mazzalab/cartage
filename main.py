import datetime
import argparse

from flask import Flask, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS, cross_origin
# from flask_bcrypt import Bcrypt

from config import config_by_name
from model.store import Product
from model.store import db
from model.store import ma
from model.store import ProductSchema
from model.db_manager import load_all_db, load_all_categoria, load_all_ditta


app = Flask(__name__)

cors = CORS(app)
db.init_app(app)
ma.init_app(app)

app.config.from_object(config_by_name['dev'])
app.config['CORS_HEADERS'] = 'Content-Type'

# flask_bcrypt = Bcrypt()


@app.route('/')
@cross_origin()
def retrieve_all_data():
    res = load_all_db()
    pschema = ProductSchema(many=True)
    output = pschema.dump(res)
    return jsonify(output)

@app.route('/categorie')
@cross_origin()
def retrieve_all_categoria():
    res = load_all_categoria()
    pschema = ProductSchema(many=True)
    output = pschema.dump(res)
    return jsonify(output.data)

@app.route('/ditte')
@cross_origin()
def retrieve_all_ditta():
    res = load_all_ditta()
    pschema = ProductSchema(many=True)
    output = pschema.dump(res)
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
            first = Product(code="234kj2t", operatore="MCD", data_evento=datetime.datetime.now(), quantita=2, categoria="guanti",
                            articolo="naso", lotto="23j23", ditta="agattaditta")
            second = Product(code="1111", operatore="Tom", data_evento=datetime.datetime.now(), quantita=0, categoria="puntali",
                             articolo="bocca", lotto="1bis", ditta="divo")
            third = Product(code="ABA222", operatore="MCD", data_evento=datetime.datetime.now(), quantita=4, categoria="fogli",
                            articolo="orecchie", lotto="183e", ditta="sillino")
            fourth = Product(code="ABA222", operatore="PIP", data_evento=datetime.datetime.now(), quantita=1, categoria="fogli",
                             articolo="orecchie", lotto="183T", ditta="sillino")
            db.session.add(first)
            db.session.add(second)
            db.session.add(third)
            db.session.add(fourth)

            db.session.commit()

            # flask_bcrypt.init_app(app)
    else:
        app.run()
