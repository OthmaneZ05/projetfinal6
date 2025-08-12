from flask import Blueprint, request, jsonify, abort
from models import db, Publication
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime
import requests

publications_bp = Blueprint('publications', __name__)

# URL du service utilisateur pour vérifier les propriétaires
USER_SERVICE_URL = "http://user_service:5000"

@publications_bp.route('/publications', methods=['GET'])
def get_all_publications():
    """
    Récupère toutes les publications avec filtres optionnels
    Query params:
    - category: filtrer par catégorie (bricolage, sport, jardinage)
    - location: filtrer par ville/région
    - min_price: prix minimum par jour
    - max_price: prix maximum par jour
    - available_only: true pour afficher seulement les articles disponibles
    - search: recherche textuelle dans le titre et description
    """
    try:
        # Construction de la requête de base
        query = Publication.query.filter_by(is_active=True)
        
        # Filtres optionnels
        category = request.args.get('category')
        if category:
            query = query.filter(Publication.category.ilike(f'%{category}%'))
            
        location = request.args.get('location')
        if location:
            query = query.filter(Publication.location.ilike(f'%{location}%'))
            
        min_price = request.args.get('min_price', type=float)
        if min_price:
            query = query.filter(Publication.price_per_day >= min_price)
            
        max_price = request.args.get('max_price', type=float)
        if max_price:
            query = query.filter(Publication.price_per_day <= max_price)
        
        sort = request.args.get('sort')
        if sort == 'date_desc':
            query = query.order_by(Publication.created_at.desc())
        elif sort == 'date_asc':
            query = query.order_by(Publication.created_at.asc())
        
        elif sort == "price_asc":
            # Prix croissant
            query = query.order_by(Publication.price_per_day.asc())

        elif sort == "price_desc":
            # Prix décroissant
            query = query.order_by(Publication.price_per_day.desc())
            
        available_only = request.args.get('available_only', 'false').lower() == 'true'
        if available_only:
            query = query.filter(Publication.is_available == True)
            
        search = request.args.get('search')
        if search:
            search_term = f'%{search}%'
            query = query.filter(
                db.or_(
                    Publication.title.ilike(search_term),
                    Publication.description.ilike(search_term)
                )
            )
        
        # Pagination
        page = request.args.get('page', 1, type=int)
        per_page = min(request.args.get('per_page', 10, type=int), 50)  # Max 50 par page
        
        publications = query.paginate(
            page=page, 
            per_page=per_page, 
            error_out=False
        )
        
        return jsonify({
            'publications': [pub.to_dict() for pub in publications.items],
            'total': publications.total,
            'total_pages': publications.pages,
            'page': page,
            'per_page': per_page
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Erreur lors de la récupération des publications: {str(e)}'}), 500

@publications_bp.route('/publications/<int:publication_id>', methods=['GET'])
def get_publication(publication_id):
    """
    Récupère les détails d'une publication spécifique
    """
    publication = Publication.query.get_or_404(publication_id)
    
    if not publication.is_active:
        return jsonify({'error': 'Publication non disponible'}), 404
        
    return jsonify(publication.to_dict()), 200

@publications_bp.route('/publications/user', methods=['GET'])
@jwt_required()
def get_user_publications():
    """
    Récupère toutes les publications d'un utilisateur connecté
    """
    user_id = int(get_jwt_identity())
    publications = Publication.query.filter_by(owner_id=user_id).all()
    
    return jsonify([pub.to_dict() for pub in publications]), 200

@publications_bp.route('/publications/create', methods=['POST'])
@jwt_required()
def create_publication():
    """
    Crée une nouvelle publication
    Champs requis: title, description, category, price_per_day, location
    Champs optionnels: images, condition, deposit_required
    """
    user_id = int(get_jwt_identity())
    data = request.get_json() or {}
    
    # Validation des champs requis
    required_fields = ['title', 'description', 'category', 'price_per_day', 'location']
    for field in required_fields:
        if field not in data or not data[field]:
            return jsonify({'error': f'Le champ {field} est requis'}), 400
    
    # Validation de la catégorie
    valid_categories = ['bricolage', 'sport', 'jardinage', 'electromenager', 'transport', 'autre']
    if data['category'].lower() not in valid_categories:
        return jsonify({
            'error': f'Catégorie invalide. Catégories autorisées: {", ".join(valid_categories)}'
        }), 400
    
    # Validation du prix
    try:
        price_per_day = float(data['price_per_day'])
        if price_per_day <= 0:
            return jsonify({'error': 'Le prix par jour doit être supérieur à 0'}), 400
    except (ValueError, TypeError):
        return jsonify({'error': 'Prix par jour invalide'}), 400
    
    try:
        new_publication = Publication(
            title=data['title'].strip(),
            description=data['description'].strip(),
            category=data['category'].lower(),
            price_per_day=price_per_day,
            location=data['location'].strip(),
            owner_id=user_id,
            images=data.get('images', []),  # Liste d'URLs d'images
            condition=data.get('condition', 'bon'),  # neuf, excellent, bon, acceptable
            deposit_required=data.get('deposit_required', 0),
            is_available=True,
            is_active=True
        )
        
        db.session.add(new_publication)
        db.session.commit()
        
        return jsonify(new_publication.to_dict()), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Erreur lors de la création de la publication: {str(e)}'}), 500

@publications_bp.route('/publications/<int:publication_id>/update', methods=['PUT'])
@jwt_required()
def update_publication(publication_id):
    """
    Met à jour une publication existante
    Seul le propriétaire peut modifier sa publication
    """
    user_id = int(get_jwt_identity())
    publication = Publication.query.get_or_404(publication_id)
    
    # Vérifier que l'utilisateur est le propriétaire
    if publication.owner_id != user_id:
        return jsonify({'error': 'Vous n\'êtes pas autorisé à modifier cette publication'}), 403
    
    data = request.get_json() or {}
    
    try:
        # Mise à jour des champs modifiables
        if 'title' in data:
            publication.title = data['title'].strip()
        if 'description' in data:
            publication.description = data['description'].strip()
        if 'category' in data:
            valid_categories = ['bricolage', 'sport', 'jardinage', 'electromenager', 'transport', 'autre']
            if data['category'].lower() in valid_categories:
                publication.category = data['category'].lower()
            else:
                return jsonify({'error': 'Catégorie invalide'}), 400
        if 'price_per_day' in data:
            price = float(data['price_per_day'])
            if price <= 0:
                return jsonify({'error': 'Le prix doit être supérieur à 0'}), 400
            publication.price_per_day = price
        if 'location' in data:
            publication.location = data['location'].strip()
        if 'images' in data:
            publication.images = data['images']
        if 'condition' in data:
            valid_conditions = ['neuf', 'excellent', 'bon', 'acceptable']
            if data['condition'].lower() in valid_conditions:
                publication.condition = data['condition'].lower()
        if 'deposit_required' in data:
            publication.deposit_required = float(data['deposit_required'])
        if 'is_available' in data:
            publication.is_available = bool(data['is_available'])
            
        publication.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify(publication.to_dict()), 200
        
    except ValueError as e:
        return jsonify({'error': 'Données invalides'}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Erreur lors de la mise à jour: {str(e)}'}), 500

@publications_bp.route('/publications/<int:publication_id>/toggle-availability', methods=['PUT'])
@jwt_required()
def toggle_availability(publication_id):
    """
    Active/désactive la disponibilité d'une publication
    """
    user_id = int(get_jwt_identity())
    publication = Publication.query.get_or_404(publication_id)
    
    if publication.owner_id != user_id:
        return jsonify({'error': 'Vous n\'êtes pas autorisé à modifier cette publication'}), 403
    
    try:
        publication.is_available = not publication.is_available
        publication.updated_at = datetime.utcnow()
        db.session.commit()
        
        status = "disponible" if publication.is_available else "indisponible"
        return jsonify({
            'message': f'Publication marquée comme {status}',
            'is_available': publication.is_available
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Erreur lors de la mise à jour: {str(e)}'}), 500

@publications_bp.route('/publications/<int:publication_id>/delete', methods=['DELETE'])
@jwt_required()
def delete_publication(publication_id):
    """
    Supprime une publication (soft delete - marque comme inactive)
    """
    user_id = int(get_jwt_identity())
    publication = Publication.query.get_or_404(publication_id)
    
    if publication.owner_id != user_id:
        return jsonify({'error': 'Vous n\'êtes pas autorisé à supprimer cette publication'}), 403
    
    # Vérifier s'il y a des réservations en cours
    try:
        # Appel au service de réservations pour vérifier
        import requests
        response = requests.get(f"http://reservation_service:5002/reservations/publication/{publication_id}")
        if response.status_code == 200:
            reservations = response.json()
            active_reservations = [r for r in reservations if r['status'] in ['pending', 'confirmed']]
            if active_reservations:
                return jsonify({
                    'error': 'Impossible de supprimer une publication avec des réservations actives'
                }), 400
    except:
        # Si le service de réservation n'est pas disponible, on continue
        pass
    
    try:
        # Soft delete - on marque comme inactive au lieu de supprimer
        publication.is_active = False
        publication.is_available = False
        publication.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({'message': 'Publication supprimée avec succès'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Erreur lors de la suppression: {str(e)}'}), 500

@publications_bp.route('/publications/categories', methods=['GET'])
def get_categories():
    """
    Retourne la liste des catégories disponibles avec le nombre de publications par catégorie
    """
    try:
        categories_stats = db.session.query(
            Publication.category,
            db.func.count(Publication.id).label('count')
        ).filter(
            Publication.is_active == True,
            Publication.is_available == True
        ).group_by(Publication.category).all()
        
        categories = {
            'bricolage': 0,
            'sport': 0, 
            'jardinage': 0,
            'electromenager': 0,
            'transport': 0,
            'autre': 0
        }
        
        for category, count in categories_stats:
            if category in categories:
                categories[category] = count
        
        return jsonify(categories), 200
        
    except Exception as e:
        return jsonify({'error': f'Erreur lors de la récupération des catégories: {str(e)}'}), 500

@publications_bp.route('/publications/search/advanced', methods=['POST'])
def advanced_search():
    """
    Recherche avancée avec critères multiples
    Body JSON: {
        "keywords": "perceuse",
        "category": "bricolage",
        "location": "Paris",
        "min_price": 10,
        "max_price": 50,
        "condition": ["bon", "excellent"],
        "available_from": "2024-01-15",
        "available_to": "2024-01-20"
    }
    """
    data = request.get_json() or {}
    
    try:
        query = Publication.query.filter_by(is_active=True, is_available=True)
        
        # Recherche par mots-clés
        if 'keywords' in data and data['keywords']:
            keywords = f"%{data['keywords']}%"
            query = query.filter(
                db.or_(
                    Publication.title.ilike(keywords),
                    Publication.description.ilike(keywords)
                )
            )
        
        # Autres filtres comme dans get_all_publications
        if 'category' in data and data['category']:
            query = query.filter(Publication.category == data['category'].lower())
        
        if 'location' in data and data['location']:
            query = query.filter(Publication.location.ilike(f"%{data['location']}%"))
        
        if 'min_price' in data:
            query = query.filter(Publication.price_per_day >= data['min_price'])
        
        if 'max_price' in data:
            query = query.filter(Publication.price_per_day <= data['max_price'])
        
        if 'condition' in data and isinstance(data['condition'], list):
            query = query.filter(Publication.condition.in_(data['condition']))
        
        # TODO: Ajouter la vérification de disponibilité par dates si nécessaire
        # Cela nécessiterait d'intégrer avec le service de réservations
        
        publications = query.all()
        
        return jsonify({
            'publications': [pub.to_dict() for pub in publications],
            'total': len(publications)
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Erreur lors de la recherche: {str(e)}'}), 500