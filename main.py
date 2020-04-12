import argparse
import datetime

from flask import Flask, jsonify, render_template, request, flash, redirect, url_for
from flask_cors import CORS, cross_origin
from flask_login import login_required, login_user, logout_user  #, current_user
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
    return render_template('labstore.html')  # , user=current_user

@app.route('/login', methods=['GET', 'POST'])
def login():
    form = LoginForm()

    if form.validate_on_submit():
        user = db_manager.do_login(form.email.data, form.password.data)
        if user:
            login_user(user, remember=True)
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

@app.route('/stores/uid/<uid>')
# @login_required
def retrieve_stores_by_user(uid:int):
    result = db_manager.load_stores(uid)
    return jsonify(result)

@app.route('/users/uid/<uid>')
# @login_required
def retrieve_users_info(uid:int):
    result = db_manager.load_user_info(uid)
    return jsonify(result)

@app.route('/categories/store/<storeid>')
# @login_required
def retrieve_categories_by_store(storeid:int):
    result = db_manager.load_categories(storeid)
    return jsonify(result)

@app.route('/companies/<categoryid>/<storeid>')
# @login_required
def retrieve_companies_by_category(categoryid:int, storeid:int):
    result = db_manager.load_companies(categoryid, storeid)
    return jsonify(result)

@app.route('/items/category/<categoryid>/company/<companyid>/store/<storeid>', methods=['POST','OPTIONS'])
# @login_required
@cross_origin()
def retrieveItemsPerCompanyAndCategory(categoryid:int, companyid:int, storeid:int):
    result = db_manager.load_items(categoryid, companyid, storeid)
    return jsonify(result)

@app.route('/batches/item/<itemid>/store/<storeid>', methods=['POST','GET'])
# @login_required
def retrieveBatchesPerItem(itemid:id, storeid:int):
    result = db_manager.load_batches_per_item(itemid, storeid)
    return jsonify(result)

## Add % Delete movements
@app.route('/add_movement', methods=['POST'])
# @login_required
def addMovement():
    json_data = request.get_json()
    addedMovement = db_manager.add_movement(
        datetime.datetime.strptime(json_data.get('date_movement')[
                                   'date_movement'], "%d/%m/%Y"),
        int(json_data.get('quantity')['quantity']),
        json_data.get('operator')['operator'],
        json_data.get('item')['item'],
        json_data.get('batch')['batch'],
    )

    db.session.add(addedMovement)
    db.session.commit()

    newmov_dict = {}
    newmov_dict['movement_id'] = addedMovement.id
    newmov_dict['item_code'] = addedMovement.item.code_item
    newmov_dict['item_name'] = addedMovement.item.name
    newmov_dict['batch_code'] = addedMovement.batch.code
    # newmov_dict['batch_expiry_date'] = addedMovement.batch.date_expiry  TODO: handle this when suggesting closest expiring items
    newmov_dict['operator_name'] = addedMovement.operator.name
    newmov_dict['operator_surname'] = addedMovement.operator.surname

    return jsonify(newmov_dict)





@app.route('/movements/store/<storeid>')
# @login_required
def retrieve_movements_by_store(storeid:int):
    result = db_manager.load_movements(storeid)
    return jsonify(result)




# @app.route('/store/<store_id>')
# def retrieve_data_of_store(store_id:int):
#     result = db_manager.load_db_for_store(store_id)
#     return jsonify(result)








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
