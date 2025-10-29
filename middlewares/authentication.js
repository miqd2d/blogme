const {verifyToken} = require("../services/authentication");

const tokenChecks = (req,res,next) =>{
    // Check if the token exists or not
    const token = req.cookies.uid;

    if(!token){
        // Redirect to the sign in Page
        // return res.redirect("/user/login");
        return next();
    }
    // Return the user if the
    const user = verifyToken(token);
    if(!user){
        return res.redirect("/user/login");
    }
    req.user = user;
    next(); 
}

const onlyLoggedUsers = (req,res,next) =>{
    const token = req.cookies.uid;
    if(!token){
        // Redirect to the sign in Page
        return res.redirect("/user/login");
    }
    // Return the user if the
    const user = verifyToken(token);
    if(!user){
        return res.redirect("/user/login");
    }
    req.user = user;
    next(); 
}

module.exports = {
    onlyLoggedUsers,
    tokenChecks,
};