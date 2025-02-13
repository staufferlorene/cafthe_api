const jwt = require("jsonwebtoken");

// Middleware pour la protection des routes
const verifyToken = (req, res, next) => {
    const token = req.headers["authorization"];

    if (!token) {
        return res.status(403).json({ message: "Token manquant" });
    }

    jwt.verify(token.split(" ")[1], process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: "Token invalide" });
        }
        req.client = decoded;
        next();
    });
};

module.exports = { verifyToken };