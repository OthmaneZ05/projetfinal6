from flask import Flask
from flask_cors import CORS
from routes import payment_bp
from dotenv import load_dotenv
import os

load_dotenv()  # Charge les variables de l'environnement

app = Flask(__name__)
CORS(app)
app.config['STRIPE_SECRET_KEY'] = os.getenv('STRIPE_SECRET_KEY')

app.register_blueprint(payment_bp)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5003, debug=True)
