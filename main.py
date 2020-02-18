import argparse
import datetime

from flask import Flask, jsonify, render_template, request, flash
from flask_cors import CORS  # , cross_origin
from flask_login import login_required
# from flask_marshmallow import Marshmallow
# from flask_sqlalchemy import SQLAlchemy

from flask_wtf import FlaskForm
from wtforms import BooleanField, PasswordField, StringField, SubmitField
from wtforms.validators import Email, InputRequired, Length

from admin.admin_page import setup_admin_home

from config import config_by_name
from persistence.database import db_manager
from persistence.model import db, login_manager, ma

# from flask_bcrypt import Bcrypt




app = Flask(__name__)
app.config.from_object(config_by_name['dev'])
app.config['FLASK_ADMIN_SWATCH'] = 'superhero'
app.config['SECRET_KEY'] = 'agaTT@powE1'
app.config['CORS_HEADERS'] = 'Content-Type'
# flask_bcrypt = Bcrypt()

db.init_app(app)
ma.init_app(app)
cors = CORS(app)
login_manager.init_app(app)
# flask_bcrypt.init_app(app)

# Instantiate the Admin interface
setup_admin_home(app)


class LoginForm(FlaskForm):
    username = StringField('username', validators=[InputRequired(), Length(min=4, max=15, message="Min/Max username lengths are 4 and 15")])
    password = StringField('password', validators=[InputRequired(), Length(min=4, max=80, message="Min/Max password lengths are 4 and 80")])
    remember = BooleanField('remember me')
    submit = SubmitField('Submit')


@app.route('/home')
def homepage():
    return render_template('index.html') # , name=name)


@app.route('/login', methods=['GET', 'POST'])
def login():
    # Here we use a class of some kind to represent and validate our
    # client-side form data. For example, WTForms is a library that will
    # handle this for us, and we use a custom LoginForm to validate.
    form = LoginForm()

    if form.validate_on_submit():
    #     # Login and validate the user.
    #     # user should be an instance of your `User` class
    #     login_user(user)
        # user = User(form.username.data, form.email.data,
        #             form.password.data)
        # db_session.add(user)
        flash('Thanks for registering', 'success')
        # return redirect(url_for('login'))

    #     next = flask.request.args.get('next')
    #     # is_safe_url should check if the url is safe for redirects.
    #     # See http://flask.pocoo.org/snippets/62/ for an example.
    #     if not is_safe_url(next):
    #         return flask.abort(400)

    #     return flask.redirect(next or flask.url_for('index'))
    else:
        if form.errors:
            print(form.errors.values())
            flash(form.errors.values().toList(), 'warning')

    return render_template('login.html', form=form)


@app.route('/')
# @login_required
def retrieve_all_data():
    result = db_manager.load_whole_db()
    return jsonify(result)


@app.route('/store/<store_id>')
def retrieve_data_of_store(store_id):
    # result = db_manager.load_whole_db()
    result = db_manager.load_db_for_store(store_id)
    return jsonify(result)


@app.route('/categories')
def retrieve_all_categories():
    result = db_manager.load_all_categories()
    return jsonify(result)


@app.route('/companies')
def retrieve_all_companies():
    result = db_manager.load_all_companies()
    return jsonify(result)


@app.route('/operators')
def retrieve_all_operators():
    result = db_manager.load_all_operators()
    return jsonify(result)


@app.route('/companies_per_category', methods=['POST'])
def retrieveCompaniesPerCategory():
    json_data = request.get_json()
    category = json_data.get('selectedCat')['category']
    result = db_manager.load_companies_per_category(category)
    return jsonify(result)


@app.route('/items_per_category_and_company', methods=['POST'])
def retrieveItemsPerCompanyAndCategory():
    json_data = request.get_json()
    category = json_data.get('selectedCatCom')['category']
    company = json_data.get('selectedCatCom')['company']
    result = db_manager.load_items_per_companies_and_category(
        category, company)
    return jsonify(result)


@app.route('/batches_per_item', methods=['POST'])
def retrieveBatchesPerItem():
    json_data = request.get_json()
    code_item = json_data.get('selectedItem')['code_item']
    result = db_manager.load_batches_per_item(code_item)
    return jsonify(result)


@app.route('/add_movement', methods=['POST'])
def addMovement():
    json_data = request.get_json()
    addedData = db_manager.add_movement(
        json_data.get('code_item')['code_item'],
        json_data.get('operator')['operator'],
        datetime.datetime.strptime(json_data.get('date_movement')[
                                   'date_movement'], "%d/%m/%Y"),
        json_data.get('batch')['batch'],
        int(json_data.get('quantity')['quantity'])
    )

    db.session.add(addedData)
    db.session.commit()
    return {'ID': addedData.id}


@app.route('/delete_movement', methods=['POST'])
def deleteMovement():
    json_data = request.get_json()
    delete_id = json_data.get('movement_id_obj')['id']
    db_manager.delete_movement(delete_id)
    db.session.commit()
    return {'ID': delete_id}


@app.route('/edit_movement', methods=['POST'])
def editMovement():
    json_data = request.get_json()
    movement_id = json_data.get('movement_info')['id']
    date = datetime.datetime.strptime(json_data.get('movement_info')[
                                      'date_movement'], "%Y-%m-%d").date()
    operator = json_data.get('movement_info')['operator']
    quantity = json_data.get('movement_info')['quantity']

    edited_move = db_manager.edit_movement(
        movement_id, date, operator, quantity)
    db.session.commit()
    return {'ID': movement_id}


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

            items = db_manager.create_empty_db()
            for item in items:
                db.session.add(item)
            db.session.commit()
    else:
        app.run()
