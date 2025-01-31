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

## Production et Déploiement VPS, la configuration HTTPS et PM2

### Installation de Certbot sur le vps

```bash
sudo snap install --classic certbot
```

### Création des certificats TLS

```bash
sudo certbot certonly -d domaine1(exemple.com) -d domaine2(www.exemple.com)
```

### Installation de docker

```bash
sudo snap install docker
```

### Configuration de docker

```bash
# vérifier que le groupe docker à bien été crée
getent group docker
# vu que docker est installé avec snap il est probable que le group ne soit pas crée
# dans ce cas il faut le créer
sudo groupadd docker

sudo usermod -aG docker ubuntu  // si ubuntu est notre nom d'utilisateur

# ajouter les autorisations au group docker
# Modifier les permissions de la socket Docker pour permettre l'accès au groupe docker
sudo chown root:docker /var/run/docker.sock
sudo chmod 660 /var/run/docker.sock

# Appliquer immédiatement le changement de groupe sans devoir se déconnecter/reconnecter
newgrp docker

# ou se déconnecter et se reconnacter
exit
ssh monvps

# verification en tapant une command docker sans sudo
docker ps -a
```

### Initialisation de la base de donnée sur le vps

Création de deux volumes docker

```bash
docker volume create db_prod_data
docker volume create db_prod_config
```

Initialisaton et configuration de la base de donnée

```bash
# se placer dans /docker-production si on a appelé notre repo git de cette façon
MONGO_INITDB_ROOT_USERNAME=adminusername MONGO_INITDB_ROOT_PASSWORD=adminpassword docker compose -f docker-compose.prod.yml run -d db

# on lance un mongosh sur notre container
docker compose -f docker-compose.prod.yml exec db mongosh

use admin
db.auth("adminusername", "adminpassword")
db.createUser({
 user: "dev",
 pwd: "dev",
 roles: [{role: "readWrite", db: "db_prod"}]})
use db_prod
db.createCollection("games")

# ajout d'un element suite à l'initialisation
db.games.insertOne({  "name": "Half life",  "platform": "PC",  "rating": "10"})

# vérifier
db.games.find().pretty()

exit

docker stop id_contianer
docker container prune
docker compose -f docker-compose.prod.yml down // supprime le network restant.
# plus verifier qu'il n'y a pas de container ou volume anonyme restant.
```

### Lancement de l'application en mode production

```bash
MONGO_USERNAME=username MONGO_PASSWORD=password docker compose -f docker-compose.prod.yml up -d
```

### Lancement et vérification de l'application en mode production

Pour lancer en mode production il faudra spécifier les variables d'environnements dans la ligne de commande docker compose. En effet, nous n'enverrons pas les variables d'environnement via un fichier .env.prod. Afin que ces données ne soient pas sur le vps.

```bash
MONGO_USERNAME=username MONGO_PASSWORD=password docker compose -f docker-compose.prod.yml up -d
```

Pour vérifier que tout se passe bien on va aller voir les logs

```jsx
docker compose -f docker compose.prod.yml logs -f
```

On peut aussi aller voir si tous nos services sont up et s’il y a eu des restart

```bash
docker compose -f docker compose.prod.yml ps
```

Normalement tout est ok et on peut voir le résultat en allant sur notre domaine

![Capture d'écran de l'application](./assets/capture.png)
