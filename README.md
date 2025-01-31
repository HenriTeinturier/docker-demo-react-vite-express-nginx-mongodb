# Application de Gestion de Jeux

🐳 Projet démo illustrant une configuration Docker multi-services :

- Nginx comme reverse proxy
- Application React (Vite) pour le front-end
- API Node.js (Express)
- Base de données MongoDB

Un exemple concret d'architecture moderne conteneurisée, avec gestion des volumes, variables d'environnement et communication inter-services. Le tout illustré à travers une application simple de gestion de jeux vidéo.

Tech: Docker 🐳 | Nginx 🔄 | React ⚛️ | Node.js 💻 | MongoDB 🍃

## Développement

### 1. Création des volumes Docker

Avant de démarrer l'application, vous devez créer deux volumes Docker pour MongoDB :

```bash
docker volume create mongodb_dev_config
docker volume create mongodb_dev_data
```

### 2. Initialisation de MongoDB

1. Dans le fichier `docker-compose.dev.yml`, décommentez le service `mongodb_init` et commentez le service `db`.

2. Lancez le conteneur d'initialisation :

```bash
docker compose -f docker-compose.dev.yml run mongodb_init
```

3. Connectez-vous à MongoDB :

---

```bash
docker compose -f docker-compose.dev.yml exec mongodb_init mongosh
```

4. Configuration de la base de données :

```bash
// Connexion en tant que super admin
use admin
db.auth('superadmin', 'superpassword')

// Création d'un nouvel utilisateur pour l'application
db.createUser({
user: "dev",
pwd: "dev",
roles: [{ role: "readWrite", db: "dev_container_db" }]
})

// Création de la base de données et de la collection
use dev_container_db
db.createCollection("games")
```

### 3. Test avec MongoDB Compass

1. Connectez-vous à MongoDB Compass avec l'URL suivante et en ajoutant les identifiants de connexion :

```bash
mongodb://dev:dev@localhost:27017
```

2. Ajoutez un document test dans la collection "games" :

```json
{
  "name": "Super Mario Odyssey",
  "platform": "Nintendo Switch",
  "rating": "9"
}
```

### 4. Installation des dépendances

1. Installez les dépendances pour le client :

```bash

cd client
npm install
```

2. Installez les dépendances pour l'API :

```bash
cd api
npm install
```

### 5. Configuration de l'environnement

1. Créez un fichier `.env.dev` à la racine du projet en utilisant `.env.example` comme modèle
2. Mettez à jour les identifiants MongoDB avec ceux créés précédemment

### 6. Lancement de l'application

Commentez ou supprimez le service `mongodb_init` dans le fichier `docker-compose.dev.yml`
Décommentez le service `db`

## Démarrez l'application en mode développement :

```bash
 docker compose -f docker-compose.dev.yml up
```

Note : Trois volumes seront créés :

- mongodb_dev_config (persistance de la configuration MongoDB)
- mongodb_dev_data (persistance des données MongoDB)
- Un volume anonyme pour le bind mount de l'application Vite

## Production

### 1. Création des volumes Docker

Avant de démarrer l'application en production, créez deux volumes Docker pour MongoDB :

```bash
docker volume create db_prod_data
docker volume create db_prod_config
```

### 2. Configuration de l'environnement

1. Créez un fichier `.env.prod` à la racine du projet en utilisant `.env.example` comme modèle
2. Mettez à jour les identifiants MongoDB avec des identifiants sécurisés pour la production

### 3. Initialisation de MongoDB

1. Dans le fichier `docker-compose.prod.yml`, décommentez le service `mongodb_init` et commentez le service `db`

2. Lancez le conteneur d'initialisation :

```bash
docker compose -f docker-compose.prod.yml run mongodb_init
```

3. Connectez-vous à MongoDB :

```bash
docker compose -f docker-compose.prod.yml exec mongodb_init mongosh
```

4. Configuration de la base de données :

```bash

// Connexion en tant que super admin
use admin
db.auth('superadmin', 'superpassword')

// Création d'un nouvel utilisateur pour l'application
db.createUser({
user: "prod_user",
pwd: "prod_password",
roles: [{ role: "readWrite", db: "db_prod" }]
})

// Création de la base de données et de la collection
use db_prod
db.createCollection("games")
```

### 4. Lancement de l'application

1. Commentez ou supprimez le service `mongodb_init` dans le fichier `docker-compose.prod.yml`
2. Décommentez le service `db`
3. Démarrez l'application en mode production :

```bash
docker compose -f docker-compose.prod.yml up -d
```

Note : Deux volumes seront créés :

- db_prod_config (persistance de la configuration MongoDB)
- db_prod_data (persistance des données MongoDB)

## Déploiement VPS, la configuration HTTPS et PM2

Pour lancer en mode production il faudra spécifier les variables d'environnements dans la ligne de commande docker compose. En effet, nous n'enverrons pas les variables d'environnement via un fichier .env.prod. Afin que ces données ne soient pas sur le vps.

```bash
MONGO_USERNAME=username MONGO_PASSWORD=password docker compose -f docker-compose.prod.yml up
```

### Installation de Certbot sur le vps

```bash
sudo snap install --classic certbot
```

### Création des certificats TLS

```bash
sudo certbot certonly -d domaine1(exemple.com) -d domaine2(www.exemple.com)
```

Conservez le lien vers le fichier de certificat et le fichier de clé privée.
