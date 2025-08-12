from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import json

db = SQLAlchemy()

class Publication(db.Model):
    """
    Modèle pour les publications de matériel
    Représente un article que quelqu'un souhaite louer
    """
    __tablename__ = 'publications'
    
    # Clé primaire
    id = db.Column(db.Integer, primary_key=True)
    
    # Informations de base
    title = db.Column(db.String(200), nullable=False, index=True)
    description = db.Column(db.Text, nullable=False)
    category = db.Column(db.String(50), nullable=False, index=True)
    
    # Informations de prix et location
    price_per_day = db.Column(db.Numeric(10, 2), nullable=False)
    deposit_required = db.Column(db.Numeric(10, 2), default=0)  # Caution éventuelle
    location = db.Column(db.String(200), nullable=False, index=True)  # Ville/région
    
    # Propriétaire (référence vers le service User)
    owner_id = db.Column(db.Integer, nullable=False, index=True)
    
    # Informations sur l'état et la disponibilité
    condition = db.Column(db.String(20), default='bon')  # neuf, excellent, bon, acceptable
    is_available = db.Column(db.Boolean, default=True, index=True)
    is_active = db.Column(db.Boolean, default=True, index=True)  # Pour soft delete
    
    # Images (stockées comme JSON - liste d'URLs)
    _images = db.Column('images', db.Text, default='[]')
    
    # Métadonnées
    created_at = db.Column(db.DateTime, default=datetime.utcnow, index=True)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Statistiques (optionnel pour le futur)
    view_count = db.Column(db.Integer, default=0)
    
    def __init__(self, **kwargs):
        """
        Constructeur de la publication
        """
        # Gestion spéciale pour les images
        if 'images' in kwargs:
            self.images = kwargs.pop('images')
        
        super(Publication, self).__init__(**kwargs)
    
    @property
    def images(self):
        """
        Getter pour les images - convertit JSON en liste Python
        """
        try:
            return json.loads(self._images) if self._images else []
        except json.JSONDecodeError:
            return []
    
    @images.setter
    def images(self, value):
        """
        Setter pour les images - convertit liste Python en JSON
        """
        if isinstance(value, list):
            self._images = json.dumps(value)
        else:
            self._images = '[]'
    
    def to_dict(self, include_sensitive=False):
        """
        Convertit l'objet Publication en dictionnaire pour l'API
        
        Args:
            include_sensitive (bool): Inclure les informations sensibles (pour le propriétaire)
        
        Returns:
            dict: Représentation dictionnaire de la publication
        """
        base_dict = {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'category': self.category,
            'price_per_day': float(self.price_per_day),
            'location': self.location,
            'condition': self.condition,
            'is_available': self.is_available,
            'images': self.images,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'view_count': self.view_count
        }
        
        # Informations sensibles (seulement pour le propriétaire)
        if include_sensitive:
            base_dict.update({
                'owner_id': self.owner_id,
                'deposit_required': float(self.deposit_required) if self.deposit_required else 0,
                'is_active': self.is_active
            })
        else:
            # Pour les autres utilisateurs, on inclut seulement la caution si elle existe
            if self.deposit_required and self.deposit_required > 0:
                base_dict['deposit_required'] = float(self.deposit_required)
        
        return base_dict
    
    def increment_view_count(self):
        """
        Incrémente le compteur de vues de la publication
        """
        self.view_count += 1
        db.session.commit()
    
    def is_owned_by(self, user_id):
        """
        Vérifie si la publication appartient à un utilisateur donné
        
        Args:
            user_id (int): ID de l'utilisateur
            
        Returns:
            bool: True si l'utilisateur est propriétaire
        """
        return self.owner_id == user_id
    
    def can_be_reserved(self):
        """
        Vérifie si la publication peut être réservée
        
        Returns:
            bool: True si la publication est disponible pour réservation
        """
        return self.is_active and self.is_available
    
    def get_category_display_name(self):
        """
        Retourne le nom d'affichage de la catégorie
        
        Returns:
            str: Nom d'affichage de la catégorie
        """
        category_names = {
            'bricolage': 'Bricolage',
            'sport': 'Sport',
            'jardinage': 'Jardinage',
            'electromenager': 'Électroménager',
            'transport': 'Transport',
            'autre': 'Autre'
        }
        return category_names.get(self.category, self.category.title())
    
    def get_condition_display_name(self):
        """
        Retourne le nom d'affichage de l'état
        
        Returns:
            str: Nom d'affichage de l'état
        """
        condition_names = {
            'neuf': 'Neuf',
            'excellent': 'Excellent état',
            'bon': 'Bon état',
            'acceptable': 'État acceptable'
        }
        return condition_names.get(self.condition, self.condition.title())
    
    def __repr__(self):
        """
        Représentation string de l'objet pour le debug
        """
        return f'<Publication {self.id}: {self.title} ({self.category})>'
    
    @staticmethod
    def get_valid_categories():
        """
        Retourne la liste des catégories valides
        
        Returns:
            list: Liste des catégories autorisées
        """
        return ['bricolage', 'sport', 'jardinage', 'electromenager', 'transport', 'autre']
    
    @staticmethod
    def get_valid_conditions():
        """
        Retourne la liste des états valides
        
        Returns:
            list: Liste des états autorisés
        """
        return ['neuf', 'excellent', 'bon', 'acceptable']
    
    @classmethod
    def search_by_keywords(cls, keywords, category=None, location=None):
        """
        Recherche des publications par mots-clés avec filtres optionnels
        
        Args:
            keywords (str): Mots-clés à rechercher
            category (str, optional): Catégorie à filtrer
            location (str, optional): Localisation à filtrer
            
        Returns:
            Query: Requête SQLAlchemy filtrée
        """
        query = cls.query.filter(
            cls.is_active == True,
            cls.is_available == True
        )
        
        if keywords:
            search_term = f'%{keywords}%'
            query = query.filter(
                db.or_(
                    cls.title.ilike(search_term),
                    cls.description.ilike(search_term)
                )
            )
        
        if category:
            query = query.filter(cls.category == category.lower())
        
        if location:
            query = query.filter(cls.location.ilike(f'%{location}%'))
        
        return query.order_by(cls.created_at.desc())
    
    @classmethod
    def get_by_owner(cls, owner_id):
        """
        Récupère toutes les publications d'un propriétaire
        
        Args:
            owner_id (int): ID du propriétaire
            
        Returns:
            Query: Requête SQLAlchemy pour les publications du propriétaire
        """
        return cls.query.filter_by(owner_id=owner_id).order_by(cls.created_at.desc())
    
    @classmethod
    def get_available_in_category(cls, category, limit=None):
        """
        Récupère les publications disponibles dans une catégorie
        
        Args:
            category (str): Catégorie à filtrer
            limit (int, optional): Nombre maximum de résultats
            
        Returns:
            Query: Requête SQLAlchemy filtrée
        """
        query = cls.query.filter(
            cls.category == category.lower(),
            cls.is_active == True,
            cls.is_available == True
        ).order_by(cls.created_at.desc())
        
        if limit:
            query = query.limit(limit)
        
        return query