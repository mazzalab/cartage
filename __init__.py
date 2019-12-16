# from flask import Flask
# from flask_sqlalchemy import SQLAlchemy
# from flask_bcrypt import Bcrypt

# from .. import db, flask_bcrypt

# from .config import config_by_name

# db = SQLAlchemy()
# flask_bcrypt = Bcrypt()


# def create_app(config_name):
#     app = Flask(__name__)
#     app.config.from_object(config_by_name[config_name])
#     db.init_app(app)
#     flask_bcrypt.init_app(app)

#     return app


from flask import Flask
from config import Config, DevelopmentConfig
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)
app.config.from_object(Config)
app.config.from_object(DevelopmentConfig)
db = SQLAlchemy(app)