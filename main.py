import argparse
import datetime

from flask import Flask, jsonify, render_template, request, flash, redirect, url_for
from flask_cors import CORS  # , cross_origin
from flask_login import login_required, login_user, logout_user
# from flask_marshmallow import Marshmallow
# from flask_sqlalchemy import SQLAlchemy

from flask_wtf import FlaskForm
from wtforms import BooleanField, PasswordField, StringField, SubmitField
from wtforms.validators import Email, InputRequired, Length

from admin.admin_page import setup_admin_home

from config import config_by_name
from persistence.database import db_manager
from persistence.model import db, ma, login_manager

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
    email = StringField('email', validators=[InputRequired(message="E-mail is a required field"), Email(message="Wrong email format")])
    password = StringField('password', validators=[InputRequired(), Length(min=4, max=80, message="Passwork length min 4 and max 80")])
    remember = BooleanField('remember me')
    submit = SubmitField('Submit')


@app.route('/')
def homepage():
    return render_template('index.html') # , name=name)

@app.route('/labstore')
@login_required
def labstorepage():
    return render_template('labstore.html')


@app.route('/login', methods=['GET', 'POST'])
def login():
    form = LoginForm()

    if form.validate_on_submit():
        user = db_manager.do_login(form.email.data, form.password.data)
        if user:
            login_user(user)
            return redirect(url_for('labstorepage'))
        else:
            flash("Not logged in", 'warning')        
    else:
        if form.errors:
            for errs in form.errors.values():
                for err in errs:
                    flash(err, 'warning')

    return render_template('login.html', form=form)


@app.route('/logout')
def logout():
    logout_user()
    flash('Succesful logout', 'success')
    return redirect(url_for('login'))


# Routes to supprot methods
@app.route('/all_records')
def retrieve_all_data():
    result = db_manager.load_whole_db()
    return jsonify(result)


@app.route('/store/<store_id>')
def retrieve_data_of_store(store_id):
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
