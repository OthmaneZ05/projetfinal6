import stripe
from flask import Blueprint, request, jsonify, current_app

payment_bp = Blueprint("payment", __name__)

@payment_bp.route("/payment/charge", methods=["POST"])
def create_charge():
    data = request.get_json()
    try:
        stripe.api_key = current_app.config['STRIPE_SECRET_KEY']

        charge = stripe.Charge.create(
            amount=data['amount'],  
            currency=data.get('currency', 'cad'),
            source=data['source'],  # token stripe envoyé depuis le frontend
            description=data.get('description', 'Paiement location voiture')
        )

        return jsonify({
            "success": True,
            "charge_id": charge['id'],
            "status": charge['status']
        }), 200

    except stripe.error.CardError as e:
        return jsonify({"success": False, "error": str(e)}), 402
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500
