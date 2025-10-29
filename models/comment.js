const { Schema, model } = require("mongoose");

// Create a comment schema
const comSchema = new Schema({
    comment :{
        type : String,
        required : true,
    },
    user : {
        type : Schema.Types.ObjectId,
        ref : "user",
    },
    blog : {
        type : Schema.Types.ObjectId,
        ref : "blog"
    }
}, {
    timestamps : true,
})

// Model
const Comment = model("comment",comSchema);

module.exports = Comment;