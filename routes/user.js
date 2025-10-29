const User = require("../models/user");
const { Router } = require("express");
const userRouter = Router();
const argon2 = require("argon2");
const { generateToken } = require("../services/authentication");

// Multer & Supabase for file upload
const supabase = require("../supaBase");
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// SignUp
userRouter.get("/signup", (req, res) => {
  res.render("signup");
});

userRouter.post("/signup", upload.single("profilePhoto"), async (req, res) => {
  const { fullName, email, password } = req.body;

  try {
    let profilePicURL = undefined;

    // If file uploaded
    if (req.file) {
      const fileName = Date.now() + "-" + req.file.originalname;

      const { data, error } = await supabase.storage
        .from("pictures") // replace with your Supabase bucket
        .upload(fileName, req.file.buffer, {
          cacheControl: "3600",
          upsert: false,
          contentType: req.file.mimetype,
        });

      if (error) throw error;

      // Get public URL
      const { data: urlData, error: urlError } = supabase.storage
        .from("pictures")
        .getPublicUrl(fileName);

      if (urlError) throw urlError;

      profilePicURL = urlData.publicUrl;
    }

    // Create user in MongoDB
    await User.create({ fullName, email, password, profilePicURL });
    res.redirect("/user/login?signup=success");
  } catch (error) {
    console.error(error);
    if (error.toString().includes("duplicate key error collection", 0)) {
      res.render("signup", { error: "User Already Exists..." });
    } else {
      res.render("signup", { error: "Unknown error..." });
    }
  }
});

// Login
userRouter.get("/login", (req, res) => {
  const { signup } = req.query;
  res.render("login", {
    message: signup === "success" ? "Sign up successful! Please log in." : null,
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
userRouter.get("/logout", (req, res) => {
  res.clearCookie("uid");
  return res.redirect("/");
});

module.exports = userRouter;
