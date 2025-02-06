const express = require("express");
const db= require("./db");
const bcrypt = require("bcrypt");
const router = express.Router();

/*
    * Route : Lister les produits
    * GET /api/produits
 */
router.get("/produit", (req, res) => {
    db.query("SELECT * FROM produit", (err, result) => {
      if(err) {
          return res.status(500).json({message: "Erreur du serveur"});
      }
      res.json(result);
    });
});

/*
    * Route : Récupérer un produit par son ID
    * GET /api/produit/:id
    * Exemple : GET /api/produit/3
 */
router.get("/produit/:id", (req, res) => {
    const { id } = req.params; //const id = req.params.id (la ligne commenté équivaut à la ligne non commenté)

    db.query("SELECT * FROM produit WHERE Id_produit = ?", [id], (err, result) => {
        if(err) {
            return res.status(500).json({message: "Erreur du serveur"});
        }

        if(result.length === 0) {
            return res.status(404).json({message: "Produit non trouvé"});
        }
        res.json(result[0]); // Retournera uniquement le 1er résultat
    });
});


/*
    * Route : Inscription d'un client
    * POST /api/client/register
    * Exemple : JSON
    * {
    * "Nom_client": "Doe",
    * "Prenom_client": "John",
    * "Telephone_client": "0612345678",
    * "Mail_client": "john.doe@email.com",
    * "Mdp_client": "password",
    * "Date_inscription": "2025-02-03",
    * "Adresse_client": "rue du test 75000 Paris"
    * }
 */
router.post("/client/register", (req, res) => {
    const { Nom_client, Prenom_client, Telephone_client, Mail_client, Mdp_client, Date_inscription, Adresse_client } = req.body;
    // Contrôler si le mail est déjà présent dans la base de donnée
    db.query("SELECT * FROM client WHERE Mail_client = ?", [Mail_client], (err, result) => {
        if(err) {
            return res.status(500).json({message: "Erreur du serveur"});
        }

        if(result.length > 0) {
            return res
                .status(400)
                .json({message: "Cette adresse mail est déjà utilisé"});
        }
});

   // Hachage du mdp
   bcrypt.hash(	Mdp_client, 10, (err, hash) => {
       if(err) {
           return res
               .status(500)
               .json({message: "Erreur lors du hachage du mdp"});
       }

       // Insertion du nouveau client
       db.query(
           "INSERT INTO client (Nom_client, Prenom_client, Telephone_client, Mail_client, Mdp_client, Date_inscription, Adresse_client) VALUES (?,?,?,?,?,?,?)",
           [Nom_client, Prenom_client, Telephone_client, Mail_client, hash, Date_inscription, Adresse_client],
           (err, result) => {
               if (err) {
                   return res
                       .status(500)
                       .json({message: "Erreur lors du hachage du mdp"});
               }

               res
                   .status(201)
                   .json({message: "Inscription réussie", client_id: result.insertId});
           },
           );
   });
});

/*
    * Route : Afficher l'historique des commandes
    * GET /api/produit/:id
    * Exemple : GET /api/commande/2
 */
router.get("/commande/client/:id", (req, res) => {
    const { id } = req.params; //const id = req.params.id (la ligne commenté équivaut à la ligne non commenté)

    db.query("SELECT * FROM commande WHERE Id_client = ?", [id], (err, result) => {
        if(err) {
            return res.status(500).json({message: "Erreur du serveur"});
        }

        if(result.length === 0) {
            return res.status(404).json({message: "Produit non trouvé"});
        }
        res.json(result);
    });
});





module.exports = router;