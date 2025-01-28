const express = require("express");
const { MongoClient } = require("mongodb");

const { MONGO_USERNAME, MONGO_PASSWORD } = process.env;
const mongoUrl = `mongodb://${MONGO_USERNAME}:${MONGO_PASSWORD}@db`;
const dbName = "dev_container_db";
const collectionName = "users";
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

app.get("/api/users", async (req, res) => {
  try {
    const users = await dbClient
      .db(dbName)
      .collection(collectionName)
      .find({})
      .toArray();

    res.status(200).json(users);
  } catch (err) {
    console.error("Erreur lors de la récupération des utilisateurs:", err);
    res.status(500).json({ message: err.message });
  }
});

app.post("/api/users", async (req, res) => {
  try {
    const { name, email } = req.body;
    // on ne vérifie pas si l'email existe déjà car c'est juste un test

    // Ajouter le nouvel utilisateur
    const result = await dbClient
      .db(dbName)
      .collection(collectionName)
      .insertOne({ name, email });

    res.status(201).json({ name, email, _id: result.insertedId });
  } catch (err) {
    console.error("Erreur lors de la création de l'utilisateur:", err);
    res.status(500).json({ message: err.message });
  }
});

app.delete("/api/users", async (req, res) => {
  try {
    const { email } = req.body;

    // Supprimer le premier utilisateur trouvé avec cet email
    await dbClient.db(dbName).collection(collectionName).deleteOne({ email });

    res.status(200).json({ message: "Utilisateur supprimé avec succès" });
  } catch (err) {
    console.error("Erreur lors de la suppression de l'utilisateur:", err);
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

// Connecter à MongoDB, puis démarrer le serveur
connectToDatabase().then(() => {
  app.listen(80);
});
