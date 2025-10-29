const { Schema, model } = require("mongoose");
const argon2 = require("argon2");
// Create a schema
const userSchema =new Schema(
  {
    fullName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["USER", "ADMIN"],
      default: "USER",
    },
    profilePicURL: {
      type: String,
      default: "/images/default.png",
    },
  },
  {
    timestamp: true,
  }
);

userSchema.index({ email: 1 }, { unique: true });


// Pre middleware for geenrating salt and hashed password
userSchema.pre("save", async function (next) {
  // Check if password is modified {when first entry it is considered true}
  if (!this.isModified("password")) return next();

  // Generate hashed password using that salt
  this.password = await argon2.hash(this.password);

  next();
});

// To veify the password
userSchema.method.verifyPassword = async function (password){
    const isMatch = await argon2.verify(password);
}

// create a model
const User = model("user", userSchema);

module.exports = User;
