import express from "express";
import mongoose from "mongoose";
import userModel from "./models/userSchema.js";
import bcrypt from "bcryptjs";
import cors from "cors";
import "dotenv/config";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());

const MONGODB_URI = process.env.MONGODB;
mongoose.connect(MONGODB_URI);
mongoose.connection.on("connected", () => {
  console.log("MongoDB connected");
});
mongoose.connection.on("error", (error) => {
  console.log(error);
});

// SIGNUP endpoint
app.post("/api/signup", async (req, res) => {
  try {
    console.log("Signup request body:", req.body); // 👈 LOG INPUT

    const { firstName, lastName, email, password } = req.body;

    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ message: "Required fields are missing..." });
    }

    const emailExist = await userModel.findOne({ email });
    if (emailExist) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const encryptedPassword = await bcrypt.hash(password, 10);
    const newUser = await userModel.create({
      firstName,
      lastName,
      email,
      password: encryptedPassword,
    });

    return res.status(200).json({
      message: "Signup successful!",
      user: newUser,
    });

  } catch (err) {
    console.error("Signup error:", err); // 👈 PRINT ERROR TO TERMINAL
    return res.status(500).json({
      message: "A server error has occurred",
      error: err.message,
    });
  }
});


// LOGIN endpoint
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Required fields are missing..." });
    }

    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    res.status(200).json({ message: "Login successful" });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
