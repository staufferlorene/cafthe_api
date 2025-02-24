const express = require("express");
const bcrypt = require("bcrypt");
const db= require("./db");
const { verifyToken } = require("./middleware")
const router = express.Router();
const jwt = require("jsonwebtoken");
const {sign} = require("jsonwebtoken");
require("dotenv").config(); // Permet de charger les variables d'environnement

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
                        .json({message: "Erreur lors de l'inscription"});
                }

                res
                    .status(201)
                    .json({message: "Inscription réussie", client_id: result.insertId});
            },
        );
    });
});

/*
    * Route : Connexion d'un client (Génération de JWT)
    * {
    * "Mail_client": "john.doe55@email.com",
    * "Mdp_client": "password"
    * }
 */
router.post("/login", (req, res) => {
    const {Mail_client, Mdp_client} = req.body;

    db.query("SELECT * FROM client WHERE Mail_client = ?", [Mail_client], (err, result) => {
        if(err) return res.status(500).json({ message: "Erreur du serveur"});
        if(result.length === 0) {return res.status(401).json({ message: "Identifiant incorrect"});
        }

        const client = result[0];

        // Vérification du mdp
        bcrypt.compare(Mdp_client, client.Mdp_client, (err, isMatch) => {
            if(err) return res.status(500).json({ message: "Erreur du serveur"});
            if(!isMatch) return res.status(401).json({ message : "Mot de passe incorrect"});

        // Génération d'un token JWT
            const token = sign(
                {id: client.Id_client, Mail_client: client.Mail_client},
                process.env.JWT_SECRET,
                {expiresIn: process.env.JWT_EXPIRES_IN},
            );

            res.json({
                message: "Connexion réussie",
                token,
                client: {
                    id: client.Id_client,
                    nom: client.Nom_client,
                    prenom: client.Prenom_client,
                    email: client.Mail_client,
                    adresse: client.Adresse_client
                },
            });
        });
    });
});

/*
    * Route : Afficher les produits et récupérer la TVA
    * GET /montantttc/produit
 */
router.get("/montantttc/produit", (req, res) => {
    db.query("SELECT * FROM produit JOIN categorie ON categorie.Id_categorie = produit.Id_categorie", (err, result) => {
        if(err) {
            return res.status(500).json({message: "Erreur du serveur"});
        } else {
            res.json(result);
        }
    });
});

/*
    * Route : Récupérer un produit par son ID
    * GET /api/produit/:id
    * Exemple : GET /api/produit/3
 */
router.get("/produit/:id", (req, res) => {
    const { id } = req.params; //const id = req.params.id (la ligne commenté équivaut à la ligne non commenté)

    db.query("SELECT * FROM produit JOIN categorie ON categorie.Id_categorie = produit.Id_categorie WHERE Id_produit = ?", [id], (err, result) => {
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
    * Route : Afficher les produits de catégorie café
    * GET /categorie/cafe
 */
router.get("/categorie/cafe", (req, res) => {
    db.query("SELECT * FROM produit JOIN categorie ON categorie.Id_categorie = produit.Id_categorie WHERE produit.Id_categorie = 2", (err, result) => {
        if(err) {
            return res.status(500).json({message: "Erreur du serveur"});
        } else {
            res.json(result);
        }
    });
});

/*
    * Route : Afficher les produits de catégorie thé
    * GET /categorie/the
 */
router.get("/categorie/the", (req, res) => {
    db.query("SELECT * FROM produit JOIN categorie ON categorie.Id_categorie = produit.Id_categorie WHERE produit.Id_categorie = 1", (err, result) => {
        if(err) {
            return res.status(500).json({message: "Erreur du serveur"});
        } else {
            res.json(result);
        }
    });
});

/*
    * Route : Afficher les produits de catégorie accessoire
    * GET /categorie/accessoire
 */
router.get("/categorie/accessoire", (req, res) => {
    db.query("SELECT * FROM produit JOIN categorie ON categorie.Id_categorie = produit.Id_categorie WHERE produit.Id_categorie = 3", (err, result) => {
        if(err) {
            return res.status(500).json({message: "Erreur du serveur"});
        } else {
            res.json(result);
        }
    });
});

 /*
    * Route : Afficher l'historique des commandes
    * GET /api/commande/client/:id_client
    * Exemple : GET /api/commande/client/2
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

/*
    * Route : Afficher le détail d'une commande
    * GET /api/commande/detail/:id_client
    * Exemple : GET /api/commande/client/2
 */
router.get("/commande/detail/:id", (req, res) => {
    const { id } = req.params;

    db.query("SELECT * FROM produit as p JOIN ligne_commande as l ON p.Id_produit = l.Id_produit JOIN commande as c ON l.Id_commande = c.Id_commande WHERE l.Id_commande = ?", [id], (err, result) => {
            if(err) {
                return res.status(500).json({message: "Erreur du serveur"});
            }

            if(result.length === 0) {
                return res.status(404).json({message: "Produit non trouvé"});
            }

            res.json(result);
        });
    });

// Route : Afficher tous les clients

router.get("/client", (request, response) => {
    db.query('select * from client', (error, result) => {
        if (error) {
            console.log(error)
        } else {
            response.json(result)
        }
    })
})


// Route : Afficher un client grâce à son ID

router.get("/client/:id", (request, response) => {
    const id = request.params.id

    db.query('select * from client where Id_client = ?', id, (error, result) => {
        if (error) {
            console.log(error)
        } else {
            response.json(result[0])
        }
    })
})

/*
    * Route : Modification des informations client sauf mdp
    * PUT /api/client/update/id_client
    * Exemple : JSON
    * {
    * "Mail_client": "test.maj@email.com",
    * "Adresse_client": "rue de la maj 41200 Romo"
    * }
 */

router.put("/client/update/:id", (request, response) => {
    const id = request.params.id
    const {Telephone_client, Mail_client, Adresse_client} = request.body

            db.query("UPDATE client SET Telephone_client = ?, Mail_client = ?, Adresse_client = ? WHERE Id_client = ?", [Telephone_client, Mail_client, Adresse_client, id], (error, result) => {
            if (error) {
                console.log(error)
            } else {
                response.json('Modification effectuée')
            }
        } )
    })

   /*
       * Route : Modification du mdp client
       * PUT /api/client/update/mdp/id_client
       * Exemple : JSON
       * {
       * "last_mdp": "password",
       * "new_mdp": "Password1"
       * }
    */

router.put("/client/update/mdp/:id", (request, response) => {
    const id = request.params.id
    const {last_mdp, new_mdp} = request.body

    //Sélectionner le mdp du client en bdd
    db.query("SELECT Mdp_client FROM client WHERE Id_client = ?", [id], (error, result) => {
        if (error) return response.status(500).json('Erreur serveur')

        // Comparer les mdp
        bcrypt.compare(last_mdp, result[0].Mdp_client, (err,isMatch) => {
            if (err) return response.status(500).json({message:'Erreur serveur'});
            if (!isMatch) return response.status(401).json({message:'Mot de passe différents'});

            // Crypter le new mdp
            bcrypt.hash(new_mdp, 10, (error, result) => {
                if (error) {
                    return response.status(500).json('Le cryptage a échoué')
                }

                // Màj le mdp
                db.query("UPDATE client SET Mdp_client = ? WHERE Id_client = ?", [result, id], (error, result) => {
                    if (error) {
                        return response.status(500).json('Erreur lors de la mise à jour du mot de passe')
                    }
                    response.status(200).json('Mot de passe mis à jour')
                })
            })
        })
    });
});



module.exports = router;