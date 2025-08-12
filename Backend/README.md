#Fonctionalité du backend
Le backend est une API RESTful qui comporte les fonctionnalités suivantes :

- **Gestion des utilisateurs** : Inscription, authentification (via token JWT), profil utilisateur

- **Gestion des voitures** : Ajout par les propriétaires (avec stockage d'image du véhicule vers Google firebase storage), Consultation de la liste des voitures disponibles (avec un filtrage par marque, modèle, prix), modification/suppression de véhicule

- **Gestion des paiements** : Création de réservation pour une voiture sur des dates spécifiques, vérification de la disponibilité, consultation/confirmation/annulation de réservation

- **Gestion des paiements** : intégration de l'API Stripe pour le paiement en ligne des réservations (création de transactions à partir d'un token de carte envoyé par le mobile !! )


#Structure de projet:
Le projet est organisé en 4 microservices:
- user/ : Service de gestion des utilisateurs, lancement sur le port 5000
- car/ : Service de gestion des voiture, lancement sur le port 5001
- reservation/ : Service de gestions des réservation, lancement sur le port 5002, ce service communique avec le service car via des appels HTTP internes
- payment/ : Service de paiement en ligne, lancement sur le port 5003, Ce service utilise un fichier .env qui contient la clé secrète Stripe.

#Instructions pour lancer le backend en local: 

- Installation de **Docker** sur votre machine
- Configurer la clé Firebase dans config/ et la clé Stripe dans le fichier .env qui se trouve dans le service payment/
- Lancement des services en exécutant la commande suivant dans la racine backend/
```bash docker-compose build ```bash
puis exécute la commande suivante pour démarrer les conteneurs 
```bash docker-compose up" 
- Pour arrêter les conteneures, tape CTRL+C dan sle terminal où tourne docker-compose