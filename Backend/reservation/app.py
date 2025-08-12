from flask import Flask, jsonify
from models import db, Reservation
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager, jwt_required, get_jwt_identity
from flask_cors import CORS

import pymysql
pymysql.install_as_MySQLdb()

import sys
from pathlib import Pathcle_secrete
sys.path.append(str(Path(__file__).parent.parent.parent))

migrate = Migrate()
jwt = JWTManager()

import os
mysql_user = os.environ.get("MYSQL_USER", "admin")
mysql_password = os.environ.get("MYSQL_PASSWORD", "admin")
mysql_host = os.environ.get("MYSQL_HOST", "db_reservation_service")  
mysql_database = os.environ.get("MYSQL_DATABASE", "projet5_reservation")

def create_app():
    app = Flask(__name__)
    app.config["SQLALCHEMY_DATABASE_URI"] = (f"mysql+pymysql://{mysql_user}:{mysql_password}@{mysql_host}:3306/{mysql_database}")
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    CORS(app)  # Permettre CORS pour toutes les routes par défaut

    app.config["JWT_SECRET_KEY"] = "cle_secrete"
    jwt.init_app(app)

    db.init_app(app)
    migrate.init_app(app, db)   

    with app.app_context():
        db.create_all()

    from routes import reservation_bp as reservation_bp_blueprint
    app.register_blueprint(reservation_bp_blueprint)

    return app

if __name__ == '__main__':
    app = create_app()
    app.run(host="0.0.0.0", port=5002)