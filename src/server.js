import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import multer from "multer";
import fs from "fs";
import axios from "axios";
import FormData from "form-data";
import { fileTypeFromFile } from "file-type";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { create } from "ipfs-http-client";

const ipfs = create({ url: "http://127.0.0.1:5001" });
const app = express();
app.use(cors());
app.use(express.json());

mongoose
  .connect("mongodb://localhost:27017/Accounts")
  .then(() => console.log("✅ DB Connected"))
  .catch((err) => console.error("❌ Error connecting to MongoDB:", err));

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

const User = mongoose.model("User", userSchema, "users");

app.post("/register", async (req, res) => {
  console.log("Received registration request:", req.body);
  const { firstName, lastName, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log("Email already registered:", email);
      return res.status(400).json({ message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ firstName, lastName, email, password: hashedPassword });
    await newUser.save();

    console.log("User registered:", newUser);
    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.log("Error registering user:", error);
    res.status(500).json({ message: "Error registering user" });
  }
});

app.post("/login", async (req, res) => {
  console.log("Received login request:", req.body);
  const { email, password } = req.body;

  try {
    const foundUser = await User.findOne({ email });
    if (!foundUser) {
      console.warn("User not found:", email);
      return res.status(404).json({ message: "User not found" });
    }

    const isValidPassword = await bcrypt.compare(password, foundUser.password);
    if (!isValidPassword) {
      console.log("Incorrect Password");
      return res.status(401).json({ message: "Incorrect Password" });
    }
    const token = jwt.sign({ id: foundUser._id }, "secret", { expiresIn: "1hr" });
    console.log("User logged in:", foundUser.email);

    res.status(200).json({ message: "User logged in successfully", token });
  } catch (error) {
    console.log("Error logging in:", error);
    res.status(500).json({ message: "Error logging in user" });
  }
});

const upload = multer({ dest: "uploads/" });

app.post("/upload", upload.single("file"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }
  console.log("📁 Received file");
  const filePath = req.file.path;
  const fileType = await fileTypeFromFile(filePath);

  if (!fileType || !["application/pdf", "image/jpeg", "image/png"].includes(fileType.mime)) {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log("🗑️ File deleted:", filePath);
    }
    return res.status(400).json({ error: "Unsupported file type" });
  }

  const formData = new FormData();
  formData.append("file", fs.createReadStream(filePath));

  let result = "No result found";
  let summary = "No summary available";

  try {
    const response = await axios.post("http://127.0.0.1:8000/search-medical-terms", formData, {
      headers: formData.getHeaders(),
    });
    console.log("📌 FastAPI Response:", response.data);
    result = response.data.result || response.data.message || result;
    summary = response.data.summary || summary;

    const fileBuffer = fs.readFileSync(filePath);
    const ipfsFile = await ipfs.add(fileBuffer);
    console.log(ipfsFile);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log("🗑️ File deleted:", filePath);
    }

    const resultData = JSON.stringify({ result, summary, fileCID: ipfsFile.path });
    const ipfsResult = await ipfs.add(resultData);
    console.log(ipfsResult);

    console.log("✅ Sending response to frontend:", {
      status: "success",
      message: result,
      summary: summary,
      fileCID: ipfsFile.path,
      resultCID: ipfsResult.path,
    });

    res.json({
      status: "success",
      message: result,
      summary: summary,
      fileCID: ipfsFile.path,
      resultCID: ipfsResult.path,
    });
  } catch (error) {
    console.error("❌ Error processing file:", error);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log("🗑️ File deleted:", filePath);
    }
    return res.status(500).json({ error: "Error processing file" });
  }
});

app.listen(3000, () => console.log("🚀 Server running on port 3000"));