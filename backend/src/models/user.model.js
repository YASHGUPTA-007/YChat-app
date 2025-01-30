import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    fullName: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    profilePic: {
      type: String,
      default: "false",
    },
    username: {
      type: String,
      required: true, // Ensure the username is required
      unique: true,   // Ensure it's unique
    },
  },
  { timestamps: true }
);

// Ensure username is unique in the database
userSchema.index({ username: 1 }, { unique: true });

const User = mongoose.model("User", userSchema);

export default User;
