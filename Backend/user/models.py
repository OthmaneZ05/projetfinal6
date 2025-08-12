import datetime
from flask_sqlalchemy import SQLAlchemy
from flask import Flask
from werkzeug.security import generate_password_hash, check_password_hash


db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'user'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    first_name = db.Column(db.String(30), nullable =False)
    last_name = db.Column(db.String(30), nullable = False)
    email = db.Column(db.String(100), unique=True, nullable = False)
    _password = db.Column(db.String(255), nullable = False)
    proprietaire = db.Column(db.Boolean, default=False, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)


    def __init__(self, **kwargs):
        password = kwargs.pop('password', None)
        super(User, self).__init__(**kwargs)
        if password:
            self.password = password  

    @property
    def password(self):
        raise AttributeError('Le mot de passe n\'est pas lisible')

    @password.setter
    def password(self, password):
        self._password = generate_password_hash(password)  

    def check_password(self, password):
        return check_password_hash(self._password, password)  


    def to_dict(self):
        return {
            "id" : self.id,
            "first_name": self.first_name,
            "last_name": self.last_name,
            "email": self.email,
            "proprietaire": self.proprietaire,
        }