const JWT = require("jsonwebtoken");
require("dotenv").config();
const key = process.env.SECRETKEYJWT

// Generating JWT for the user logging in
const generateToken  = (user) =>{
    const payload = {
        id : user._id,
        fullName : user.fullName,
        email : user.email,
        profilePicURL : user.profilePicURL,
        role : user.role,
    };
    return JWT.sign(payload,key);
}

const verifyToken = (token) =>{
    if(!token) return null;
    return JWT.verify(token,key);
}

module.exports = {
    generateToken,
    verifyToken,
}