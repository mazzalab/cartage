from itsdangerous import URLSafeTimedSerializer


class TokenGenerator:
    def __init__(self, app):
        self._app = app

    def init(self, app):
        self._app = app

    def generate_confirmation_token(self, email):
        serializer = URLSafeTimedSerializer(self._app.config['SECRET_KEY'])
        return serializer.dumps(email, salt=self._app.config['SECURITY_PASSWORD_SALT'])

    def confirm_token(self, token, expiration=3600):
        serializer = URLSafeTimedSerializer(self._app.config['SECRET_KEY'])
        try:
            email = serializer.loads(
                token,
                salt=self._app.config['SECURITY_PASSWORD_SALT'],
                max_age=expiration
            )
        except Exception as e:
            print(e)
            return False
        return email
