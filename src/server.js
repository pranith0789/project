// // import express from "express";
// // import mongoose from "mongoose";
// // import cors from "cors";
// // import bcrypt from "bcrypt";
// // import jwt from "jsonwebtoken";
// // import fs from "fs";
// // import axios from "axios";
// // import multer from "multer";
// // import FormData from "form-data";
// // import { fileTypeFromFile } from "file-type"; // ✅ Correct import

// // const app = express();
// // app.use(cors());
// // app.use(express.json());
// // app.use(express.urlencoded({ extended: true }));

// // mongoose
// //   .connect("mongodb://localhost:27017/Accounts")
// //   .then(() => console.log("✅ DB Connected"))
// //   .catch((err) => console.error("❌ Error connecting to MongoDB:", err));

// // const userschema = new mongoose.Schema({
// //   firstName: { type: String, required: true },
// //   lastName: { type: String, required: true },
// //   email: { type: String, required: true, unique: true },
// //   password: { type: String, required: true },
// // });

// // const User = mongoose.model("User", userschema, "Users");

// // app.post("/register", async (req, res) => {
// //   console.log("🔹 Received registration request:", req.body);
// //   const { firstName, lastName, email, password } = req.body;

// //   try {
// //     const existingUser = await User.findOne({ email });
// //     if (existingUser) {
// //       console.warn("⚠️ Email already registered:", email);
// //       return res.status(400).json({ message: "Email already registered" });
// //     }

// //     const hashedPassword = await bcrypt.hash(password, 10);
// //     const newUser = new User({ firstName, lastName, email, password: hashedPassword });
// //     await newUser.save();

// //     console.log("✅ User registered:", newUser);
// //     res.status(201).json({ message: "User registered successfully" });
// //   } catch (error) {
// //     console.error("❌ Error registering user:", error);
// //     res.status(500).json({ message: "Error registering user" });
// //   }
// // });

// // app.post("/login", async (req, res) => {
// //   console.log("🔹 Received login request:", req.body);
// //   const { email, password } = req.body;

// //   try {
// //     const foundUser = await User.findOne({ email });
// //     if (!foundUser) {
// //       console.warn("⚠️ User not found:", email);
// //       return res.status(404).json({ message: "User not found" });
// //     }

// //     const isValidPassword = await bcrypt.compare(password, foundUser.password);
// //     if (!isValidPassword) {
// //       console.warn("⚠️ Invalid password for user:", email);
// //       return res.status(401).json({ message: "Invalid password" });
// //     }

// //     const token = jwt.sign({ id: foundUser._id }, "secret", { expiresIn: "1h" });
// //     console.log("✅ User logged in:", foundUser.email);

// //     res.status(200).json({ message: "User logged in successfully", token });
// //   } catch (error) {
// //     console.error("❌ Error logging in:", error);
// //     res.status(500).json({ message: "Error logging in user" });
// //   }
// // });

// // const upload = multer({ dest: "uploads/" });

// // app.post("/upload", upload.single("file"), async (req, res) => {
// //     if (!req.file) {
// //         console.error("❌ No file uploaded!");
// //         return res.status(400).json({ error: "No file uploaded" });
// //     }

// //     const filePath = req.file.path;
// //     const detectedType = await fileTypeFromFile(filePath); // ✅ Corrected function name
// //     console.log("📂 Detected file type:", detectedType);

// //     if (!detectedType || detectedType.mime !== "application/pdf") {
// //         console.warn("⚠️ Invalid file type detected:", detectedType ? detectedType.mime : "Unknown");
// //         fs.unlinkSync(filePath);
// //         return res.status(400).json({ error: "Invalid file type. Please upload a PDF file." });
// //     }

// //     const formData = new FormData();
// //     formData.append("file", fs.createReadStream(filePath));

// //     try {
// //         console.log("📡 Sending file to FastAPI...");
// //         const response = await axios.post(
// //             "http://127.0.0.1:8000/search-medical-terms",
// //             formData,
// //             { headers: formData.getHeaders() }
// //         );

// //         console.log("✅ Response from FastAPI:", response.data);
// //         fs.unlinkSync(filePath);
// //         console.log("🗑 File deleted:", filePath);
// //         res.json(response.data);
// //     } catch (error) {
// //         console.error("❌ Error processing file:", error);
// //         fs.unlinkSync(filePath);
// //         res.status(500).json({ error: "Error processing file" });
// //     }
// // });

// // app.listen(3000, () => {
// //   console.log("🚀 Server is running on port 3000");
// // });
// import express from "express";
// import mongoose from "mongoose";
// import cors from "cors";
// import multer from "multer";
// import fs from "fs";
// import axios from "axios";
// import FormData from "form-data";
// import { fileTypeFromFile } from "file-type";

// const app = express();
// app.use(cors());
// app.use(express.json());

// mongoose.connect("mongodb://localhost:27017/Accounts")
//   .then(() => console.log("✅ DB Connected"))
//   .catch((err) => console.error("❌ Error connecting to MongoDB:", err));

// const upload = multer({ dest: "uploads/" });

// app.post("/upload", upload.single("file"), async (req, res) => {
//   if (!req.file) {
//       return res.status(400).json({ error: "No file uploaded" });
//   }

//   const filePath = req.file.path;
//   const formData = new FormData();
//   formData.append("file", fs.createReadStream(filePath));

//   try {
//       const response = await axios.post(
//           "http://127.0.0.1:8000/search-medical-terms",
//           formData,
//           { headers: formData.getHeaders() }
//       );

//       const result = response.data.result || response.data.message;
//       fs.unlinkSync(filePath);  // Cleanup uploaded file

//       res.json({ status: "success", message: result }); // Send result to frontend
//   } catch (error) {
//       fs.unlinkSync(filePath);
//       res.status(500).json({ error: "Error processing file" });
//   }
// });


// app.listen(3000, () => console.log("🚀 Server running on port 3000"));
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import multer from "multer";
import fs from "fs";
import axios from "axios";
import FormData from "form-data";
import { fileTypeFromFile } from "file-type";

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect("mongodb://localhost:27017/Accounts")
  .then(() => console.log("✅ DB Connected"))
  .catch((err) => console.error("❌ Error connecting to MongoDB:", err));

const upload = multer({ dest: "uploads/" });

app.post("/upload", upload.single("file"), async (req, res) => {
  if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
  }

  const filePath = req.file.path;
  const fileType = await fileTypeFromFile(filePath);

  if (!fileType || !["application/pdf", "image/jpeg", "image/png"].includes(fileType.mime)) {
      fs.unlinkSync(filePath);
      return res.status(400).json({ error: "Unsupported file type" });
  }

  const formData = new FormData();
  formData.append("file", fs.createReadStream(filePath));

  try {
      const response = await axios.post(
          "http://127.0.0.1:8000/search-medical-terms",
          formData,
          { headers: formData.getHeaders() }
      );

      const result = response.data.result || response.data.message;
      fs.unlinkSync(filePath);

      res.json({ status: "success", message: result,summary:result });
  } catch (error) {
      fs.unlinkSync(filePath);
      res.status(500).json({ error: "Error processing file" });
  }
});

app.listen(3000, () => console.log("🚀 Server running on port 3000"));
