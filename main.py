import datetime
import argparse

from flask import Flask
from flask_sqlalchemy import SQLAlchemy
# from flask_bcrypt import Bcrypt

from config import config_by_name
from model.store import Product
from model.store import db
from model.store import ma
from model.db_manager import load_all_db


app = Flask(__name__)
app.config.from_object(config_by_name['dev'])

db.init_app(app)
ma.init_app(app)

# flask_bcrypt = Bcrypt()

@app.route('/')
def retrieve_all_data():
    return load_all_db()

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument('-l', '--load', action='store_true', help="create and load db")
    parser.add_argument('-r', '--run', action='store_true', help="run the cartage")
    args = parser.parse_args()

    if args.load:
        with app.app_context():
            db.create_all()
            first = Product(operatore="MCD", data_evento=datetime.date.today(), quantita=2, categoria="guanti",
                            codice_articolo="234kj2t", articolo="naso", lotto="23j23", ditta="agattaditta")
            second = Product(operatore="Tom", data_evento=datetime.date.today(), quantita=-1, categoria="puntali",
                            codice_articolo="1111", articolo="bocca", lotto="1bis", ditta="divo")
            third = Product(operatore="MCD", data_evento=datetime.date.today(), quantita=4, categoria="fogli",
                            codice_articolo="ABA222", articolo="orecchie", lotto="183e", ditta="sillino")
            db.session.add(first)
            db.session.add(second)
            db.session.add(third)

            db.session.commit()

            # flask_bcrypt.init_app(app)
    else:
        app.run()
