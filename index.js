const express = require("express");
const cors = require("cors");
const db= require("./db"); // Connexion à MySQL
const routes = require("./endpoints"); //Les routes de l'API

const app = express();
app.use(express.json());
app.use(cors());

// Utilisation des routes
// app.use("/api", routes);

// Démarrer le serveur
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`L'API CafThé est démarré sur http://localhost:${PORT}`);
});