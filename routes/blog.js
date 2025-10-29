const { Router } = require("express");
const blogRouter = Router();

// Importing the Blog model
const Blogs = require("../models/blog");
const Comment = require("../models/comment");

// Importing Multer & Supabase to handle the cover image upload
const supabase = require("../supaBase");
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

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

    try {
      let coverImage = undefined;

      // If file uploaded
      if (req.file) {
        const fileName = Date.now() + "-" + req.file.originalname;

        const { data, error } = await supabase.storage
          .from("pictures")
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

        coverImage = urlData.publicUrl;
      }
      await Blogs.create({
        title,
        body,
        createdBy: req.user.id,
        coverImage,
      });
      // Set coverImage
      // let coverImage;
      // if (req.file) {
      //   // A file was uploaded
      //   coverImage = `uploads/${req.file.filename}`;
      // } else {
      //   // No file uploaded, use default
      //   coverImage = "uploads/default.png";
      // }

      // Create blog
    } catch (error) {
      console.error(error);
      console.log("Error ho gaya");
      res.redirect("/");
    }

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
  const comments = await Comment.find({ blog: req.params.id }).populate("user");

  // If signed in send user
  if (req.user) {
    return res.render("blogPage", {
      blog: blog,
      user: req.user,
      comments: comments,
    });
  }
  return res.render("blogPage", {
    blog: blog,
    comments: comments,
  });
});

// Handling comments
blogRouter.post("/:id/comment", async (req, res) => {
  const { comment } = req.body;
  const blogID = req.params.id;
  const user = req.user;

  await Comment.create({
    comment,
    user: user.id,
    blog: blogID,
  });

  return res.redirect(`/blog/${blogID}`);
});

module.exports = blogRouter;
