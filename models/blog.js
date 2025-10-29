const { Schema, model } = require("mongoose");

const blogSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      unique: true,
    },
    body: {
      type: String,
      required: true,
    },
    coverImage: {
      type: String,
      default : "https://fheveoramynzflqahwmp.supabase.co/storage/v1/object/public/pictures/default_blog.png"
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "user",
    },
  },
  { timestamps: true }
);

const Blogs = model("blog",blogSchema);

module.exports = Blogs;