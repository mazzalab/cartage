from typing import Tuple

from flask import current_app as app, url_for
from persistence.database import db_manager

from flask_wtf import FlaskForm
from flask_mail import Mail, Message
from flask_security.forms import ForgotPasswordForm, LoginForm, RegisterForm, ResetPasswordForm, Required, Email, Length

from wtforms.fields import BooleanField, PasswordField, StringField, SelectField, SubmitField
from wtforms.widgets import HiddenInput
from wtforms.validators import InputRequired
from token_generator import TokenGenerator


class LoginForm(LoginForm):
    email = StringField('email', validators=[InputRequired(message="E-mail is a required field"), Email(message="Wrong email format")])
    password = StringField('password', validators=[InputRequired(), Length(min=6, max=50, message="Passwork length min 6 and max 50")])
    remember = BooleanField('remember me')
    # submit = SubmitField('Submit')


class ForgotPasswordForm(ForgotPasswordForm):
    # user = StringField('Email address', validators=[Email(message="Wrong email format"), InputRequired(message="E-mail is a required field")])
    user = StringField("Email Address")
    # submit = SubmitField('Submit')


class ResetPasswordForm(ResetPasswordForm):
    # password = PasswordField('Password', validators=[InputRequired(), Length(min=6, max=50, message="Passwork length min 6 and max 50")])
    # retype_password = PasswordField('Retype Password', validators=[InputRequired(), Length(min=6, max=50, message="Passwork length min 6 and max 50")])
    pass


class RegistrationForm(RegisterForm):
    email = StringField('Email Address', validators=[InputRequired(
        message="E-mail is a required field"), Email(message="Wrong email format")])
    # password = PasswordField('Password', validators=[InputRequired(), Length(min=6, max=50, message="Passwork length min 6 and max 50")])
    # retype_password = PasswordField('Retype Password', validators=[InputRequired(), Length(min=6, max=50, message="Passwork length min 6 and max 50")])
    name = StringField('First Name', validators=[InputRequired(
        message="First name is required"), Length(max=50, message="Max name length is 50")])
    surname = StringField('Last name', validators=[InputRequired(
        message="Last name is required"), Length(max=50, message="Max surname length is 50")])
    laboratory_id = SelectField('Laboratory', validators=[
                                InputRequired(message="Laboratory is mandatory")], coerce=int)
    active = BooleanField(default='checked', render_kw={
                          'checked': False}, false_values=('false', 'False', False, ))

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.mail = Mail(app)

        # Dynamically load available laboratories
        self.laboratory_id.choices = db_manager.load_laboratories()

    def validate(self):
        if (super(RegistrationForm, self).validate()):
            tgen = TokenGenerator(app)
            token = tgen.generate_confirmation_token(self.email.data)
            confirm_url = url_for('confirm_registration',
                                  token=token, _external=True)

            # Send a confirmation email to the laboratory head
            name_email_lab_head: Tuple[str, str] = db_manager.load_lab_head(
                self.laboratory_id.data)
            with app.app_context():
                msg = Message(subject="Confirm registration for {} {}".format(self.name.data, self.surname.data),
                              # TODO: replace SOFTWARE NAME with a global variable referecing the final software name
                              sender=("SOFTWARE NAME",
                                      app.config.get("MAIL_USERNAME")),
                              recipients=[name_email_lab_head[1]],
                              html="<p>Dear {}<br/>Please follow this link to grant {} {} access to the store of your laboratory:</p><p><a href='{}'>{}</a></p><p>Cheers!</p>".format(
                                  name_email_lab_head[0],
                                  self.name.data,
                                  self.surname.data,
                                  confirm_url,
                                  confirm_url))
                self.mail.send(msg)
            return True

        return False
