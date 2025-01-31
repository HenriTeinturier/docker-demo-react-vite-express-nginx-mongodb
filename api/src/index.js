const express = require("express");
const { MongoClient } = require("mongodb");

const { MONGO_USERNAME, MONGO_PASSWORD } = process.env;
const mongoUrl = `mongodb://${MONGO_USERNAME}:${MONGO_PASSWORD}@db:27017`;
const nodeEnvironment = (process.env.NODE_ENV || "development").trim();
const dbName =
  nodeEnvironment === "production" ? "db_prod" : "dev_container_db";
const collectionName = "games";
let dbClient;

const app = express();
app.use(express.json()); // Pour parser les requêtes JSON

// Connexion à MongoDB avant de démarrer le serveur
async function connectToDatabase() {
  try {
    dbClient = new MongoClient(mongoUrl);
    await dbClient.connect();
  } catch (err) {
    console.error("Error connecting to MongoDB:", err);
    process.exit(1); // Arrêter le serveur si la connexion échoue
  }
}

app.get("/api/games", async (req, res) => {
  try {
    const games = await dbClient
      .db(dbName)
      .collection(collectionName)
      .find({})
      .toArray();

    res.status(200).json(games);
  } catch (err) {
    console.error("Erreur lors de la récupération des jeux:", err);
    res.status(500).json({ message: err.message });
  }
});

app.post("/api/games", async (req, res) => {
  try {
    const { name, platform, rating } = req.body;

    // Ajouter le nouvel jeu
    const result = await dbClient
      .db(dbName)
      .collection(collectionName)
      .insertOne({ name, platform, rating });

    res.status(201).json({ name, platform, rating, _id: result.insertedId });
  } catch (err) {
    console.error("Erreur lors de la création du jeu:", err);
    res.status(500).json({ message: err.message });
  }
});

app.delete("/api/games", async (req, res) => {
  try {
    const { name } = req.body;

    // Supprimer le premier jeu trouvé avec ce nom
    await dbClient.db(dbName).collection(collectionName).deleteOne({ name });

    res.status(200).json({ message: "Utilisateur supprimé avec succès" });
  } catch (err) {
    console.error("Erreur lors de la suppression du jeu:", err);
    res.status(500).json({ message: err.message });
  }
});

// Route 404 - doit être placée après toutes les autres routes
app.all("*", (req, res) => {
  res.status(404).json({
    message: "Route non trouvée",
    path: req.path,
  });
});

process.on("SIGINT", () => {
  server.close((error) => {
    if (error) {
      console.error("Erreur lors de la fermeture du serveur:", error);
      process.exit(1);
    } else {
      if (dbClient) {
        dbClient.close((err) => {
          if (err) {
            console.error(
              "Erreur lors de la fermeture de la connexion à MongoDB:",
              err
            );
            process.exit(1);
          } else {
            console.log("Connexion à MongoDB fermée");
            process.exit(0);
          }
        });
      }
    }
  });
});

// Connecter à MongoDB, puis démarrer le serveur
connectToDatabase().then(() => {
  app.listen(80);
});
