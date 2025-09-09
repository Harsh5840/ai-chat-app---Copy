import  {JSON_WEB_TOKEN_SECRET } from '../config.js';
import jwt from "jsonwebtoken";


const authMiddleware = async (req, res, next) => {
    try {
        const token = req.headers.authorization;
        
        if (!token || !token.startsWith("Bearer ")) {
            return res.status(401).json({
                message: "No token provided. Please include 'Bearer <token>' in Authorization header"
            });
        }

        const tokenValue = token.split(" ")[1];
        
        if (!tokenValue) {
            return res.status(401).json({
                message: "Invalid token format"
            });
        }

        const decoded = jwt.verify(tokenValue, JSON_WEB_TOKEN_SECRET);
        
        if (!decoded.id) {
            return res.status(403).json({
                message: "Invalid token payload"
            });
        }

        req.userId = decoded.id;
        next();

    } catch (error) {
        console.error('Auth middleware error:', error.message);
        
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                message: "Token has expired. Please login again"
            });
        }
        
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                message: "Invalid token"
            });
        }
        
        res.status(401).json({
            message: "Authentication failed"
        });
    }
}
export { authMiddleware };