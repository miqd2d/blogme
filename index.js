// Importing modules
require("dotenv").config();
const path = require("path");
const express = require("express");
const app = express();
const PORT = process.env.PORT;
const connectDB = require("./connection");

// Routes
const userRouter = require("./routes/user");
const blogRouter = require("./routes/blog");

// middlewares
const {tokenChecks} = require("./middlewares/authentication");
const cookieParser = require("cookie-parser");

// Models
const Blogs = require("./models/blog");

connectDB(process.env.DBurl).then(() => {
  console.log("Database connected...");

  // Views
  app.set("view engine", "ejs");
  app.set("views", path.resolve("./views"));

  // Middleware
  app.use(express.urlencoded({ extended: false }));
  app.use(cookieParser());
  app.use(express.static("public"));
  app.use(tokenChecks);

  // Routes
  app.use("/user", userRouter); //For login,signup,logout
  app.use("/blog", blogRouter); //For login,signup,logout

  app.get("/", async (req, res) => {
    // Get all the blogs
    const allBlogs = await Blogs.find({}).populate("createdBy");
    if (allBlogs.length == 0) {
      res.render("home", {
        user: req.user,
      });
    } else {
      res.render("home", {
        user: req.user,
        blogs: allBlogs,
      });
    }
  });

  // temp

  app.listen(PORT, () => {
    console.log(`App listening @ port : ${PORT}`);
  });
});
