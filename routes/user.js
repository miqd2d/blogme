const User = require("../models/user");
const { Router } = require("express");
const userRouter = Router();
const argon2 = require("argon2");
const {generateToken} = require("../services/authentication")

// Multer for file upload
const multer = require("multer");
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = "./public/images";
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + file.originalname;
    cb(null, uniqueSuffix)
  }
})
const upload = multer({ storage: storage })

// SignUp
userRouter.get("/signup", (req, res) => {
  res.render("signup");
});

userRouter.post("/signup", upload.single("profilePhoto") ,async (req, res) => {
  const { fullName, email, password } = req.body;
  try {

    // check if profilePhoto uploaded
    if(req.file){
      await User.create({ fullName, email, password , profilePicURL: `images/${req.file.filename}` });
      return res.redirect("/user/login?signup=success");
    }
    // If no photo uploaded
    await User.create({ fullName, email, password });
    res.redirect("/user/login?signup=success");

  } catch (error) {
    if (error.toString().includes("duplicate key error collection",0)) {
      res.render("signup", {
        error: "User Already Exists...",
      });
    } else {
      res.render("signup", {
        error: "Unknown error...",
      });
    }
  }
});

// Login
userRouter.get("/login", (req, res) => {
  const { signup } = req.query;
  res.render("login", {
    message: signup === "success" ? "Sign up successful! Please log in." : null
  });
});


userRouter.post("/login", async (req, res) => {
  // Verify the password and redirect to the homepage
  const { email, password } = req.body;
  // First check if the user even exists using only email
  const user = await User.findOne({ email });
  // if no user send the invalid cred message
  if (!user) {
    return res.render("login", { error: "Wrong Credentials...Try Again..." });
  }
  // check Password
  const isValid = await argon2.verify(user.password, password);
  if (isValid) {
    res.cookie("uid", generateToken(user));
    return res.redirect("/");
  } else {
    return res.render("login", { error: "Wrong Credentials...Try Again..." });
  }
});

// logout
userRouter.get("/logout",(req,res)=>{
  res.clearCookie("uid");
  return res.redirect("/");
})

module.exports = userRouter;
