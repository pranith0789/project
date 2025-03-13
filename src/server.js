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
import {create} from 'ipfs-http-client'
import { json } from "stream/consumers";

const ipfs = create({url:"http://127.0.0.1:5001"})
const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect("mongodb://localhost:27017/Accounts")
  .then(() => console.log("✅ DB Connected"))
  .catch((err) => console.error("❌ Error connecting to MongoDB:", err));


const userschema = new mongoose.Schema({
    
    firstName : {type : String , required : true},
    lastName : {type : String, required : true},
    email : {type : String , required : true, unique : true},
    password : {type : String , required : true}

})


const User = mongoose.model("User",userschema,"users")

app.post("/register", async(req,res) => {
    console.log("Received registration request:",req.body)
    const{firstName,lastName,email,password} = req.body

    try{
        const exhistingUser = await User.findOne({email})
        if(exhistingUser){
            console.log("Email already registered:",email)
            return res.status(400).json({message:"Email already registered"})
        }

        const hashedPassword = await bcrypt.hash(password,10);
        const newUser = new User({firstName,lastName,email,password:hashedPassword})
        await newUser.save()


        console.log("User registered:",newUser)
        res.status(201).json({message:"user registered successfully"});
    }catch(error){
        console.log("Error registering user:",error)
        res.status(500).json({message:"Error registering user"})
    }
})


app.post("/login", async(req,res) => {
    console.log("Received Login request:",req.body)
    const {email,password} = req.body;

    try{
        const founduser = await User.findOne({email})
        if(!founduser){
            console.warn("User not found:",email)
            return res.status(404).json({message:"User not found"})
        }

        const isValidPassword = await bcrypt.compare(password,founduser.password)
        if(!isValidPassword){
            console.log("Incorrect Password")
            return res.status(404).json({message:"Incorrect Password"})
        }
        const token = jwt.sign({id:founduser._id},"secret",{expiresIn:"1hr"})
        console.log("user logged in:",founduser.email)

        res.status(200).json({message:"user logged in successfully",token})
    }catch(error){
        console.log("Error logging in:",error)
        res.status(500).json({message:"Error logging in user"})
    }
})
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
      console.log("📌 FastAPI Response:", response.data);
      const result = response.data.result || response.data.message;
      const summary = response.data.summary ? response.data.summary : result.includes("COVID") ? null : "No summary available";



      const filebuffer = fs.readFileSync(filePath)
      const ipfsFile = await ipfs.add(filebuffer)
      console.log(ipfsFile)
      fs.unlinkSync(filePath);


      const resultdata = JSON.stringify({result,summary,fileCID: ipfsFile.path})
      const ipfsresult = await ipfs.add(resultdata)
      console.log(ipfsresult)
      console.log("✅ Sending response to frontend:", {
        status: "success",
        message: result,
        summary: structured_data,
        fileCID: ipfsFile.path,
        resultCID: ipfsresult.path
    });
    
    res.json({
        status: "success",
        message: result,
        summary: summary,  // Include summary here
        fileCID: ipfsFile.path,
        resultCID: ipfsresult.path
      });
      
  } catch (error) {
      fs.unlinkSync(filePath);
      res.status(500).json({ error: "Error processing file" });
  }
});

app.listen(3000, () => console.log("🚀 Server running on port 3000"));


