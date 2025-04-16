const {JSON_WEB_TOKEN_SECRET} = require('../config');

const jwt = require("jsonwebtoken");

const authMiddleware = async (req, res, next) => {
    const token = req.headers.authorization;
    if (!token || !token.startsWith("Bearer ")) {
        return res.status(401).json({
            message: "No token provided"
        })
    }
    try {
        const decoded = jwt.verify(token.split(" ")[1], JSON_WEB_TOKEN_SECRET);
        if (decoded.id) {
            req.userId = decoded.id;
            next();
        }else{
            res.status(403).json();
        }
       
    } catch (error) {
        res.status(401).json({
            message: "Invalid token"
        })
    }
}
module.exports = {
    authMiddleware: authMiddleware
}       