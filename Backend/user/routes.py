from flask import Blueprint, request, jsonify, abort
from models import db, User
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity


user_bp = Blueprint('users', __name__)

@user_bp.route('/users', methods = ['GET'])
def get_users():
    users = User.query.all()
    return jsonify([user.to_dict() for user in users]), 200

@user_bp.route('/users/<int:user_id>', methods = ['GET'])
def get_user(user_id):
    user = User.query.get(user_id)
    if not user:
        abort(404, description = " Utilisateur non trouvé ")
    return jsonify(user.to_dict()), 200

@user_bp.route('/users/register', methods = ['POST'])
def register_user():
    data = request.get_json()
    infos = ['first_name', 'last_name', 'email', 'password']
    for info in infos:
        if info not in data:
            return jsonify({"Erreur : " : f"Tous les champs sont obligatoires, {info} manquant"}), 400
    try:
        user_existant = User.query.filter_by(email = data['email']).first()
        if user_existant:
            return jsonify({"Erreur : " : f"Un utilisateur avec l'email {data['email']} existe déjà"}), 409

        new_user = User(
            first_name = data['first_name'],
            last_name = data['last_name'],
            email = data['email'],
            password = data['password']
            #proprietaire=data.get('proprietaire', False)
        )
        db.session.add(new_user)
        db.session.commit()
        return jsonify(new_user.to_dict()), 201
    
    except ValueError as e:
        return jsonify({"Erreur : " : f"Erreur lors de la création de l'utilisateur {e}"}), 400
    
    except Exception as e:
        db.session.rollback()
        return jsonify({"Erreur : ": f"Une erreur est survenue  lors de l'inscription {str(e)}"}), 500


@user_bp.route("/users/update/<int:user_id>", methods = ["PUT"])
def update_user(user_id):
    user = User.query.get_or_404(user_id)
    data = request.get_json()
    try: 
        if "first_name" in data:
            user.first_name = data["first_name"]
        if "last_name" in data:
            user.last_name = data["last_name"]
        if "email" in data:
            user.email = data["email"]
        if "password" in data:
            user.password = data["password"]

        db.session.commit()
        return jsonify(user.to_dict())

    except ValueError as e:
        return jsonify({"Erreur : " : f"Erreur lors de la mise à jour"}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({"Erreur : " : f"Une erreur est survenue lors de la modification de l'utilisateur"}), 500

@user_bp.route("/users/delete/<int:user_id>", methods = ["DELETE"])
def delete_user(user_id):
    user = User.query.get_or_404(user_id)
    try:
        db.session.delete(user)
        db.session.commit()

        return jsonify({"Message : " : "Utilisateur effacé avec succés"}), 200 
    except Exception as e:
        db.session.rollback()
        return jsonify({"Erreur : " : f"Une erreur est survenue lors de la suppression de l'utilisateur {str(e)}"}), 500
    
@user_bp.route("/users/login", methods = ["POST"])
def login_user():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    
    if not email or not password:
        return jsonify({"Erreur : " : "Veuillez fournir votre email et votre mot de passe"}), 400
    
    user = User.query.filter_by(email = email).first()
    if not user or not user.check_password(password):
        return jsonify({"Erreur : " : "Email ou mot de passe incorrect"}), 401
    
    access_token = create_access_token(identity=str(user.id))
    return_response = {
        "access_token" : access_token,
        "Message : ": "Vous êtes connecté avec succès"
    }
    return jsonify(return_response), 200

@user_bp.route("/users/me", methods = ["GET"])
@jwt_required()
def current_user():
    user_id = get_jwt_identity()
    user = User.query.get_or_404(int(user_id))

    if not user:
        return jsonify({"Erreur : " : "Utilisateur non trouvé"}), 404

    return jsonify(user.to_dict()), 200