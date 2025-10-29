const path = require("path");

const { Router } = require("express");
const blogRouter = Router();

// Importing the Blog model
const Blogs = require("../models/blog");
const Comment = require("../models/comment");

// Importing Multer to handle the cover image upload
const multer = require("multer");
// Initializing the destination and filename
const storage = multer.diskStorage({
  destination: async function (req, file, cb) {
    const uploadPath = "./public/uploads";
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + file.originalname;
    cb(null, uniqueSuffix);
  },
});

const upload = multer({ storage });

// Add a middleware here that make sures that only logged in user's get to access this page
const { onlyLoggedUsers } = require("../middlewares/authentication");

blogRouter.get("/add", onlyLoggedUsers, (req, res) => {
  res.render("addBlogs", { user: req.user });
});

blogRouter.post(
  "/add",
  onlyLoggedUsers,
  upload.single("coverImage"),
  async (req, res) => {
    const { title, body } = req.body;

    // Set coverImage
    let coverImage;
    if (req.file) {
      // A file was uploaded
      coverImage = `uploads/${req.file.filename}`;
    } else {
      // No file uploaded, use default
      coverImage = "uploads/default.png";
    }

    // Create blog
    await Blogs.create({
      title,
      body,
      createdBy: req.user.id,
      coverImage,
    });

    // Actual redirect
    // res.redirect(`/blog/${user.id}`);

    res.redirect("/");
  }
);

// Blog Page
blogRouter.get("/:id", async (req, res) => {
  const blog = await Blogs.findOne({ _id: req.params.id }).populate(
    "createdBy"
  );
  const comments = await Comment.find({ blog : req.params.id }).populate(
    "user"
  );;

  // If signed in send user
  if (req.user) {
    return res.render("blogPage", {
      blog: blog,
      user: req.user,
      comments : comments
    });
  }
  return res.render("blogPage", {
    blog: blog,
    comments : comments
  });
});

// Handling comments
blogRouter.post("/:id/comment",async (req,res)=>{
  const {comment} = req.body;
  const blogID = req.params.id;
  const user = req.user;

  await Comment.create({
    comment,user : user.id , blog : blogID
  })

  return res.redirect(`/blog/${blogID}`);

})

module.exports = blogRouter;
