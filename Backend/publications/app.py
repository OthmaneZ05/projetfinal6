from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from routes import publications_bp
from models import db
import os
from flask_cors import CORS

def create_app():
    """
    Factory function pour créer l'application Flask
    """
    app = Flask(__name__)
    # Configuration de l'application
    app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev-secret-key-change-in-production')
    app.config['JWT_SECRET_KEY'] = 'cle_secrete'
    
    # Configuration de la base de données MySQL
    mysql_host = os.environ.get('MYSQL_HOST', 'localhost')
    mysql_user = os.environ.get('MYSQL_USER', 'admin')
    mysql_password = os.environ.get('MYSQL_PASSWORD', 'admin')
    mysql_database = os.environ.get('MYSQL_DATABASE', 'projet5_publications')
    
    app.config['SQLALCHEMY_DATABASE_URI'] = f'mysql+pymysql://{mysql_user}:{mysql_password}@{mysql_host}/{mysql_database}'
    
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    
    # Configuration JWT
    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = False  # Token n'expire pas (pour le dev)
    
    # Initialisation des extensions
    db.init_app(app)
    jwt = JWTManager(app)
    
    # Configuration CORS pour permettre les requêtes cross-origin
    CORS(app, origins=["http://localhost:3000", "http://127.0.0.1:3000"], supports_credentials=True)
    
    # Enregistrement des blueprints
    app.register_blueprint(publications_bp, url_prefix='')
    
    # Gestionnaire d'erreur JWT personnalisé
    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_payload):
        return {'error': 'Token expiré'}, 401
    
    @jwt.invalid_token_loader
    def invalid_token_callback(error):
        return {'error': 'Token invalide'}, 401
    
    @jwt.unauthorized_loader
    def missing_token_callback(error):
        return {'error': 'Token d\'authentification requis'}, 401
    
    # Route de santé pour vérifier que le service fonctionne
    @app.route('/health')
    def health_check():
        return {'status': 'OK', 'service': 'publications'}, 200
    
    # Route d'information sur le service
    @app.route('/api/info')
    def service_info():
        return {
            'service': 'Publications Service',
            'version': '1.0.0',
            'description': 'Service de gestion des publications de matériel',
            'endpoints': {
                'GET /api/publications': 'Liste toutes les publications avec filtres',
                'GET /api/publications/{id}': 'Détails d\'une publication',
                'GET /api/publications/user': 'Publications de l\'utilisateur connecté',
                'POST /api/publications/create': 'Créer une nouvelle publication',
                'PUT /api/publications/{id}/update': 'Mettre à jour une publication',
                'PUT /api/publications/{id}/toggle-availability': 'Activer/désactiver la disponibilité',
                'DELETE /api/publications/{id}/delete': 'Supprimer une publication',
                'GET /api/publications/categories': 'Statistiques par catégorie',
                'POST /api/publications/search/advanced': 'Recherche avancée'
            }
        }, 200
    
    # Création des tables de base de données
    with app.app_context():
        db.create_all()
        print("Tables de base de données créées avec succès!")
    
    return app

if __name__ == '__main__':
    app = create_app()
    
    # Configuration pour le développement
    debug_mode = os.environ.get('FLASK_ENV') == 'development'
    port = int(os.environ.get('PORT', 5004))  # Port 5003 pour le service publications
    
    print(f"🚀 Service Publications démarré sur le port {port}")
    print(f"📝 Mode debug: {debug_mode}")
    
    app.run(
        host='0.0.0.0',
        port=port,
        debug=debug_mode
    )