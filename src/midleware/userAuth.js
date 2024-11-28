const jwt = require('jsonwebtoken')
 require('dotenv').config


 const Authentication = (req, res, next) => {
     const token = req.cookies.token;
     const refreshToken = req.cookies.refreshToken;
 
     if (!token && !refreshToken) {
         return res.status(401).json({ msg: "Missing token" });
     }
 
     const verifyToken = (token, secret) =>
         new Promise((resolve, reject) => {
             jwt.verify(token, secret, (err, user) => {
                 if (err) reject(err);
                 else resolve(user);
             });
         });
 
     const processToken = async () => {
         try {
             if (token) {
                 req.users = await verifyToken(token, process.env.JWT_SECRET);
                 return next();
             }
 
             if (refreshToken) {
                 req.users = await verifyToken(refreshToken, process.env.JWT_REFRESH_SECRET);
                 return next();
             }
         } catch (err) {
             console.error("Authentication error:", err.message);
             return res.status(401).json({ msg: "Invalid token" });
         }
     };
 
     processToken();
 };

  module.exports = Authentication;