import { generateToken } from "../lib/utils.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import cloudinary from "../lib/cloudinary.js";

// export const signup = async (req, res) => {
//   const { fullName, email, password } = req.body;
//   try {
//     if (!fullName || !email || !password) {
//       return res.status(400).json({ message: "All fields are required" });
//     }

//     if (password.length < 6) {
//       return res.status(400).json({ message: "Password must be at least 6 characters" });
//     }

//     const user = await User.findOne({ email });

//     if (user) return res.status(400).json({ message: "Email already exists" });

//     const salt = await bcrypt.genSalt(10);
//     const hashedPassword = await bcrypt.hash(password, salt);

//     const newUser = new User({
//       fullName,
//       email,
//       password: hashedPassword,
//     });

//     if (newUser) {
//       // generate jwt token here
//       generateToken(newUser._id, res);
//       await newUser.save();

//       res.status(201).json({
//         _id: newUser._id,
//         fullName: newUser.fullName,
//         email: newUser.email,
//         profilePic: newUser.profilePic,
//       });
//     } else {
//       res.status(400).json({ message: "Invalid user data" });
//     }
//   } catch (error) {
//     console.log("Error in signup controller", error.message);
//     res.status(500).json({ message: "Internal Server Error" });
//   }
// };

export const signup = async (req, res) => {
  const { fullName, email, password } = req.body;

  try {
    // Validate input fields
    if (!fullName || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    // Check if email already exists
    const userByEmail = await User.findOne({ email });
    if (userByEmail) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // Generate username from email
    const emailUsername = email.split('@')[0];  // Extract part before '@'
    
    // Check if username already exists, if it does, modify it by appending a number
    let username = emailUsername;
    let usernameExists = await User.findOne({ username });
    let counter = 1;
    
    while (usernameExists) {
      username = `${emailUsername}${counter}`;
      usernameExists = await User.findOne({ username });
      counter++;
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create the new user
    const newUser = new User({
      fullName,
      email,
      password: hashedPassword,
      username, // Use the generated username
    });

    // Save the new user to the database
    await newUser.save();

    // Generate JWT token
    generateToken(newUser._id, res);

    // Respond with the created user data, including the username
    res.status(201).json({
      _id: newUser._id,
      fullName: newUser.fullName,
      email: newUser.email,
      profilePic: newUser.profilePic,
      username: newUser.username, // Include the username in the response
    });
  } catch (error) {
    console.log("Error in signup controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    generateToken(user._id, res);

    res.status(200).json({
    
      fullName: user.fullName,
      email: user.email,
      profilePic: user.profilePic,
    });
  } catch (error) {
    console.log("Error in login controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const logout = (req, res) => {
  try {
    res.cookie("jwt", "", { maxAge: 0 });
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.log("Error in logout controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { profilePic } = req.body;
    const userId = req.user._id;

    if (!profilePic) {
      return res.status(400).json({ message: "Profile pic is required" });
    }

    const uploadResponse = await cloudinary.uploader.upload(profilePic);
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profilePic: uploadResponse.secure_url },
      { new: true }
    );

    res.status(200).json(updatedUser);
  } catch (error) {
    console.log("error in update profile:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const checkAuth = (req, res) => {
  try {
    res.status(200).json(req.user);
  } catch (error) {
    console.log("Error in checkAuth controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};