from flask import Flask, jsonify, request, Blueprint
from models import db, Reservation
from flask_jwt_extended import jwt_required, get_jwt_identity
import requests
from datetime import datetime, timedelta

reservation_bp = Blueprint('reservations', __name__)

# URL des microservices
USER_SERVICE_URL = "http://user_service:5000"  # URL du service utilisateur
CAR_SERVICE_URL = "http://car_service:5001"  # URL du service voiture

#Fonction pour calculer le prix total de la location
def calculate_total_price(start_date, end_date, price_per_day):
    start = datetime.strptime(start_date, "%Y-%m-%d").date()
    end = datetime.strptime(end_date, "%Y-%m-%d").date()
    days = (end - start).days + 1  # + 1 pour ajouter le dernier jour
    if days < 0:
        raise ValueError("La date de fin doit être après la date de début.")
    return days * price_per_day

#Fonction qui vérifie si la voiture est disponible pour des dates spécifiques
def is_car_available(car_id, start_date, end_date):
    start = datetime.strptime(start_date, "%Y-%m-%d").date()
    end = datetime.strptime(end_date, "%Y-%m-%d").date()
    
    # Vérifier si la voiture existe et est marquée comme disponible
    try:
        response = requests.get(f"{CAR_SERVICE_URL}/car/{car_id}")

        if response.status_code != 200:
            return False
        car_data = response.json()
        if not car_data.get('is_available', False):
            return False
    except Exception as e:   
        return False
    
    # Vérifier si la voiture n'est pas réservée quelque part d'autre
    overlapping_reservations = Reservation.query.filter(
        Reservation.car_id == car_id,
        Reservation.status.in_(['pending', 'confirmed']),
        db.or_(
            db.and_(
                Reservation.start_date <= end,
                Reservation.end_date >= start
            )
        )
    ).all()
    
    return len(overlapping_reservations) == 0

@reservation_bp.route('/reservations', methods=['GET'])
@jwt_required()
def get_all_reservations():
    #Route et fonction pour récupérer toutes les réservations
    reservations = Reservation.query.all()
    return jsonify([reservation.to_dict() for reservation in reservations]), 200


@reservation_bp.route('/reservations/user', methods=['GET'])
@jwt_required()
def get_user_reservations():
    #Fonction qui récupére toutes les réservations d'un utilisateur connecté
    user_id = int(get_jwt_identity())
    reservations = Reservation.query.filter_by(user_id=user_id).all()
    return jsonify([reservation.to_dict() for reservation in reservations]), 200

#Route qui affiche toutes les réservations d'une seule voiture ( pour le propriétaire)
@reservation_bp.route('/reservations/car/<int:car_id>', methods=['GET'])
@jwt_required()
def get_car_reservations(car_id):
    user_id = int(get_jwt_identity())
    # Vérifier si l'utilisateur est le propriétaire de la voiture
    try:
        response = requests.get(f"{CAR_SERVICE_URL}/car/{car_id}")
        if response.status_code != 200:
            return jsonify({"error": "Voiture non trouvée"}), 404
        
        car_data = response.json()
        if car_data.get('owner_id') != user_id:
            return jsonify({"error": "Vous n'êtes pas autorisé à voir ces réservations"}), 403
    except Exception as e:
        return jsonify({"error": f"Erreur lors de la vérification de la voiture: {str(e)}"}), 500
    
    # Récupérer les réservations pour cette voiture
    reservations = Reservation.query.filter_by(car_id=car_id).all()
    return jsonify([reservation.to_dict() for reservation in reservations]), 200

#Route qui affiche les détails d'une réservation pour le locataire our le propriétaire de la voiture
@reservation_bp.route('/reservations/<int:reservation_id>', methods=['GET'])
@jwt_required()
def get_reservation(reservation_id):
    
    user_id = int(get_jwt_identity())
    reservation = Reservation.query.get_or_404(reservation_id)
    
    # Vérifier si l'utilisateur est le locataire
    if reservation.user_id == user_id:
        return jsonify(reservation.to_dict()), 200
    
    # Vérifier si l'utilisateur est le propriétaire de la voiture
    try:
        response = requests.get(f"{CAR_SERVICE_URL}/car/{reservation.car_id}")
        if response.status_code == 200:
            car_data = response.json()
            if car_data.get('owner_id') == user_id:
                return jsonify(reservation.to_dict()), 200
    except Exception:
        pass
    
    return jsonify({"error": "Vous n'êtes pas autorisé à voir cette réservation"}), 403

#Route POST pour créer une nouvelle réservation
@reservation_bp.route('/reservations/create', methods=['POST'])
@jwt_required()
def create_reservation():

    user_id = int(get_jwt_identity())
    data = request.get_json() or {}
    
    # Vérifier les champs requis
    for field in ['car_id', 'start_date', 'end_date']:
        if field not in data:
            return jsonify({"error": f"Le champ {field} est requis"}), 400
    
    car_id = data['car_id']
    start_date = data['start_date']
    end_date = data['end_date']
    
    
    # Vérifier si la voiture est disponible
    if not is_car_available(car_id, start_date, end_date):
        return jsonify({"error": "La voiture n'est pas disponible pour ces dates"}), 409
    
    # Récupérer le prix par jour de la voiture
    try:
        response = requests.get(f"{CAR_SERVICE_URL}/car/{car_id}")
        if response.status_code != 200:
            return jsonify({"error": "Voiture non trouvée"}), 404
        
        car_data = response.json()
        price_per_day = car_data.get('price_per_day')
        
        # Vérifier que l'utilisateur n'est pas le propriétaire de la voiture
        if car_data.get('owner_id') == user_id:
            return jsonify({"error": "Vous ne pouvez pas réserver votre propre voiture"}), 400
        
    except Exception as e:
        return jsonify({"error": f"Erreur lors de la récupération des informations de la voiture: {str(e)}"}), 500
    
    start = datetime.strptime(start_date, "%Y-%m-%d").date()
    end = datetime.strptime(end_date, "%Y-%m-%d").date() 
    total_price = calculate_total_price(start_date, end_date, price_per_day)
    
    new_reservation = Reservation(
        car_id=car_id,
        user_id=user_id,
        start_date=start,
        end_date=end,
        total_price=total_price,
        status='pending'  # Statut initial en attente de confirmation
    )
    
    try:
        db.session.add(new_reservation)
        db.session.commit()
        
        # TODO: Envoyer une notification au propriétaire de la voiture
        
        return jsonify(new_reservation.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Erreur lors de la création de la réservation: {str(e)}"}), 500

#Route PUT pour confirmer une réservation   
@reservation_bp.route('/reservations/<int:reservation_id>/confirm', methods=['PUT'])
@jwt_required()
def confirm_reservation(reservation_id):
    
    user_id = int(get_jwt_identity())
    reservation = Reservation.query.get_or_404(reservation_id)
    
    # Vérifier que la réservation est en attente
    if reservation.status != 'pending':
        return jsonify({"error": "Seules les réservations en attente peuvent être confirmées"}), 400
    
    # Vérifier que l'utilisateur est le propriétaire de la voiture
    try:
        response = requests.get(f"{CAR_SERVICE_URL}/car/{reservation.car_id}")
        if response.status_code != 200:
            return jsonify({"error": "Voiture non trouvée"}), 404
        
        car_data = response.json()
        if car_data.get('owner_id') != user_id:
            return jsonify({"error": "Vous n'êtes pas autorisé à confirmer cette réservation"}), 403
    except Exception as e:
        return jsonify({"error": f"Erreur lors de la vérification de la voiture: {str(e)}"}), 500
    
    # Mettre à jour le statut de la réservation
    reservation.status = 'confirmed'
    reservation.updated_at = datetime.utcnow()
    
    try:
        db.session.commit()
        
        # TODO: Envoyer une notification au locataire
        
        return jsonify(reservation.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Erreur lors de la confirmation de la réservation: {str(e)}"}), 500

#Route pour annuler une réservation (peut etre faite que par le locataire ou le proprietaire)
@reservation_bp.route('/reservations/<int:reservation_id>/cancel', methods=['PUT'])
@jwt_required()
def cancel_reservation(reservation_id):
    
    user_id = int(get_jwt_identity())
    reservation = Reservation.query.get_or_404(reservation_id)
    
    # Vérifier que la réservation n'est pas déjà terminée ou annulée
    if reservation.status in ['cancelled', 'completed']:
        return jsonify({"error": f"La réservation est déjà {reservation.status}"}), 400
    
    # Vérifier que l'utilisateur est soit le locataire, soit le propriétaire de la voiture
    is_owner = False
    if reservation.user_id != user_id:
        try:
            response = requests.get(f"{CAR_SERVICE_URL}/car/{reservation.car_id}")
            if response.status_code == 200:
                car_data = response.json()
                if car_data.get('owner_id') == user_id:
                    is_owner = True
                else:
                    return jsonify({"error": "Vous n'êtes pas autorisé à annuler cette réservation"}), 403
            else:
                return jsonify({"error": "Voiture non trouvée"}), 404
        except Exception as e:
            return jsonify({"error": f"Erreur lors de la vérification de la voiture: {str(e)}"}), 500
    
    # Mettre à jour le statut de la réservation
    reservation.status = 'cancelled'
    reservation.updated_at = datetime.utcnow()
    
    try:
        db.session.commit()
        
        # TODO: Envoyer une notification au locataire ou au propriétaire
        #notify_user_id = reservation.user_id if is_owner else None  # ID du propriétaire à récupérer
        
        return jsonify(reservation.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Erreur lors de l'annulation de la réservation: {str(e)}"}), 500

#Route pour marquer une réservation comme complete (proprietaire)
@reservation_bp.route('/reservations/<int:reservation_id>/complete', methods=['PUT'])
@jwt_required()
def complete_reservation(reservation_id):

    user_id = int(get_jwt_identity())
    reservation = Reservation.query.get_or_404(reservation_id)
    
    # Vérifier que la réservation est confirmée
    if reservation.status != 'confirmed':
        return jsonify({"error": "Seules les réservations confirmées peuvent être marquées comme terminées"}), 400
    
    # Vérifier que l'utilisateur est le propriétaire de la voiture
    try:
        response = requests.get(f"{CAR_SERVICE_URL}/car/{reservation.car_id}")
        if response.status_code != 200:
            return jsonify({"error": "Voiture non trouvée"}), 404
        
        car_data = response.json()
        if car_data.get('owner_id') != user_id:
            return jsonify({"error": "Vous n'êtes pas autorisé à terminer cette réservation"}), 403
    except Exception as e:
        return jsonify({"error": f"Erreur lors de la vérification de la voiture: {str(e)}"}), 500
    
    # Mettre à jour le statut de la réservation
    reservation.status = 'completed'
    reservation.updated_at = datetime.utcnow()
    
    try:
        db.session.commit()
        
        # TODO: Envoyer une notification au locataire pour laisser un avis
        
        return jsonify(reservation.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Erreur lors de la finalisation de la réservation: {str(e)}"}), 500

#Route pour vérifier si la voiture est disponible pour des dates spécifiques
@reservation_bp.route('/reservations/check-availability', methods=['GET'])
def check_availability():
    
    car_id = request.args.get('car_id', type=int)
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')
    
    if not all([car_id, start_date, end_date]):
        return jsonify({"error": "Les paramètres car_id, start_date et end_date sont requis"}), 400
    
    try:
        is_available = is_car_available(car_id, start_date, end_date)
        return jsonify({"available": is_available}), 200
    except ValueError:
        return jsonify({"error": "Format de date invalide. Utilisez YYYY-MM-DD"}), 400
    except Exception as e:
        return jsonify({"error": f"Erreur lors de la vérification de la disponibilité: {str(e)}"}), 500