import argparse
import datetime
import secrets

from flask import Flask, jsonify, render_template, request, flash, redirect, url_for
from flask_cors import CORS, cross_origin
from flask_security import Security, SQLAlchemyUserDatastore, UserMixin, RoleMixin, login_required, logout_user
from flask_security.utils import hash_password
from flask_mail import Mail, Message
from token_generator import TokenGenerator

from config import config_by_name
from persistence.database import db_manager
from persistence.model import db, ma
from persistence.model.account_store import user_datastore
from forms import RegistrationForm, LoginForm, ForgotPasswordForm, ResetPasswordForm


app = Flask(__name__)
app.config.from_object(config_by_name['dev'])
app.config['CORS_HEADERS'] = 'Content-Type'
app.config['SECURITY_RECOVERABLE'] = True
app.config['SECURITY_REGISTERABLE'] = True
app.config['SECURITY_POST_LOGIN_VIEW'] = "/labstore"
app.config['SECURITY_POST_RESET_VIEW'] = '/login'  ## TODO: fix this redirect
app.config['SECRET_KEY'] = 'secretkey'  # TODO: to be locked
app.config['SECURITY_PASSWORD_SALT'] = 'secretsalt'  # TODO: to be locked
app.config['MAIL_SERVER'] = 'out.virgilio.it'
app.config['MAIL_PORT'] = 465
app.config['MAIL_USE_SSL'] = True
app.config['MAIL_USERNAME'] = 'irongraft@virgilio.it'
app.config['MAIL_PASSWORD'] = 'JesusBless1979'
app.config['SECURITY_EMAIL_SENDER'] = 'irongraft@virgilio.it'
app.config['SECURITY_EMAIL_SUBJECT_PASSWORD_RESET'] = "Cartage - Password reset instructions"
app.config['SECURITY_EMAIL_SUBJECT_PASSWORD_RESET'] = "Cartage - Password has been changed"

db.init_app(app)
ma.init_app(app)
security = Security(app, user_datastore, register_form=RegistrationForm, login_form=LoginForm, forgot_password_form=ForgotPasswordForm, reset_password_form=ResetPasswordForm)
mail = Mail(app)
mailToken = TokenGenerator(app)
cors = CORS(app)


@app.route('/')
def homepage():
    return render_template('index.html')  # , name=name)

@app.route('/confirm/<token>', methods=['GET', 'POST'])
# @login_required
def confirm_registration(token: str):
    try:
        email = mailToken.confirm_token(token)
    except:
        flash('The confirmation link is invalid or has expired.', 'danger')

    user = db_manager.load_user_by_email(email=email)
    if user.active:
        flash('Account already confirmed.', 'success')
    else:
        # Update the user status to active
        user.active = True
        user.confirmed_at = datetime.datetime.now()

        # Assign the user a sefault role
        default_role = user_datastore.find_role("user")
        user_datastore.add_role_to_user(user, default_role)

        # commit and push changes
        db.session.add(user)
        db.session.commit()
        flash('You have confirmed this account. Thanks!', 'success')

        # Send confirmation email to the user
        with app.app_context():
            msg = Message(subject="Hello",
                          sender=app.config.get("MAIL_USERNAME"),
                          recipients=[email],
                          body="Your account has been confirmed!")
            mail.send(msg)
    return redirect(url_for('homepage'))

@app.route('/profile')
# @login_required
def profile():
    return render_template('profile.html')

@app.route('/labstore')
# @login_required
def labstorepage():
    return render_template('labstore.html')  # , user=current_user

@app.route('/logout')
def logout():
    logout_user()
    flash('Succesful logout', 'success')
    return redirect(url_for('login'))

@app.route('/stores/uid/<uid>')
# @login_required
def retrieve_stores_by_user(uid: int):
    result = db_manager.load_stores(uid)
    return jsonify(result)

@app.route('/users/uid/<uid>')
# @login_required
def retrieve_users_info(uid: int):
    result = db_manager.load_user_info(uid)
    return jsonify(result)

@app.route('/categories/store/<storeid>')
# @login_required
def retrieve_categories_by_store(storeid: int):
    result = db_manager.load_categories(storeid)
    return jsonify(result)

@app.route('/companies/<categoryid>/<storeid>')
# @login_required
def retrieve_companies_by_category(categoryid: int, storeid: int):
    result = db_manager.load_companies(categoryid, storeid)
    return jsonify(result)

@app.route('/items/category/<categoryid>/company/<companyid>/store/<storeid>', methods=['POST', 'OPTIONS'])
# @login_required
#@cross_origin()
def retrieveItemsPerCompanyAndCategory(categoryid: int, companyid: int, storeid: int):
    result = db_manager.load_items(categoryid, companyid, storeid)
    return jsonify(result)

@app.route('/batches/item/<itemid>/store/<storeid>', methods=['POST', 'GET'])
# @login_required
def retrieveBatchesPerItem(itemid: id, storeid: int):
    result = db_manager.load_batches_per_item(itemid, storeid)
    return jsonify(result)

@app.route('/batches/movement/<movementid>', methods=['GET'])
# @login_required
def retrieveBatchesPerMovement(movementid: int):
    result = db_manager.load_batches_per_movement(movementid)
    return jsonify(result)

@app.route('/movements/store/<storeid>')
# @login_required
def retrieve_movements_by_store(storeid: int):
    result = db_manager.load_movements(storeid)
    return jsonify(result)


################################################
# Add, Edit and Delete movements
@app.route('/add_movement', methods=['POST'])
# @login_required
def addMovement():
    json_data = request.get_json()
    addedMovement = db_manager.add_movement(
        datetime.datetime.strptime(json_data.get('date_movement')[
                                   'date_movement'], "%d/%m/%Y"),
        int(json_data.get('quantity')['quantity']),
        json_data.get('operator')['operator'],
        json_data.get('item')['itemId'],
        json_data.get('batch')['batchId'],
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

@app.route('/edit_movement', methods=['POST'])
# @login_required
def editMovement():
    json_data = request.get_json()
    movement_id = json_data.get('movement_info')['id']
    date = datetime.datetime.strptime(json_data.get('movement_info')[
                                      'date_movement'], "%Y-%m-%d").date()
    batch = json_data.get('movement_info')['batch']
    quantity = json_data.get('movement_info')['quantity']

    edited_move = db_manager.edit_movement(
        movement_id, date, batch, quantity)
    db.session.commit()
    return {'ID': movement_id}

@app.route('/delete_movement', methods=['POST'])
# @login_required
def deleteMovement():
    json_data = request.get_json()
    delete_id = json_data.get('movement_id_obj')['id']
    db_manager.delete_movement(delete_id)
    db.session.commit()
    return {'ID': delete_id}
################################################


################################################
# InfoBox previews
@app.route('/expiring/store/<storeid>', methods=['GET'])
# @login_required
def retrieve_expiring_by_store(storeid: int):
    result = db_manager.load_expiring_by_store(storeid)
    return jsonify(result)

@app.route('/runningout/store/<storeid>', methods=['GET'])
# @login_required
def retrieve_runningout_by_store(storeid: int):
    result = db_manager.load_runningout_by_store(storeid)
    return jsonify(result)
################################################



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
