import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import bcrypt, { hash } from 'bcrypt'
import jwt from 'jsonwebtoken'


const app = express()
app.use(cors())
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


mongoose.connect('mongodb://localhost:27017/Accounts')
.then(() => console.log('DB Connected'))
.catch(err => console.log('Error connecting to MongoDB',err))



const userschema = new mongoose.Schema({
    firstName : {type:String,required:true},
    lastName : {type:String,required:true},
    email : {type:String,required:true,unique:true},
    password : {type:String,required:true},
})


const user = mongoose.model('user',userschema)


app.post('/register', async(req,res) => {
    console.log("Received registratio information",req.body)
    const {firstName,lastName,email,password} = req.body
    try{
        const hashedPassword = await bcrypt.hash(password,10);
        const newUser = new user({ firstName, lastName, email, password: hashedPassword })
        await newUser.save()
        console.log('user registered:',newUser)
        const storedUser = await user.findOne({ email });
        console.log("Stored User in DB:", storedUser);
        res.status(201).json({message:'User registered successfully'})
    }catch(error){
        console.log("Error registering user",error)
        res.status(500).send({message:"Error registering user"})
    }
})


app.post('/login',async(req,res) => {
    console.log("Received login information",req.body)
    const {email,password} = req.body
    try{
        const user = await user.findOne({email})
        if(!user){
            return res.status(404).json({message:"User not found"})
        }
        const isValidPassword = await bcrypt.compare(password,user.password)
        if(!isValidPassword){
            return res.status(401).json({message:"Invalid password"})
        }
        const token = jwt.sign({ id: user._id }, 'secret', { expiresIn: '1h' })
        res.status(200).json({ message: "User logged in successfully", token });

    }catch{
        console.log('Error Loggin in:',error)
        res.status(500).send({message:"Error logging in user"})
    }
})


app.listen(3000,() => {
    console.log("server is running on port 3000")
});