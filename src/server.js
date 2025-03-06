import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

const app = express()
app.use(cors())
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

mongoose.connect('mongodb://localhost:27017/Accounts')
.then(() => console.log('DB Connected'))
.catch(err => console.log('Error connecting to MongoDB', err))

const userschema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
})

// 🔹 Fix: Change 'user' to 'User' to avoid conflicts
const User = mongoose.model('User', userschema, 'Users')

app.post('/register', async (req, res) => {
    console.log("Received registration information", req.body)
    const { firstName, lastName, email, password } = req.body

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ firstName, lastName, email, password: hashedPassword }) // 🔹 Fix: Use 'User' instead of 'user'
        await newUser.save()
        console.log('User registered:', newUser)
        res.status(201).json({ message: 'User registered successfully' })
    } catch (error) {
        console.log("Error registering user", error)
        res.status(500).send({ message: "Error registering user" })
    }
})

app.post('/login', async (req, res) => {
    console.log("Received login information", req.body);
    const { email, password } = req.body;

    try {
        const founduser = await User.findOne({ email }); // Use 'User' instead of 'user'
        if (!founduser) {
            return res.status(404).json({ message: "User not found" });
        }

        const isValidPassword = await bcrypt.compare(password, founduser.password);
        if (!isValidPassword) {
            return res.status(401).json({ message: "Invalid password" });
        }

        const token = jwt.sign({ id: founduser._id }, 'secret', { expiresIn: '1h' });

        res.status(200).json({ message: "User logged in successfully", token });
    } catch (error) {
        console.log('Error Logging in:', error);
        res.status(500).send({ message: "Error logging in user" });
    }
});


app.listen(3000, () => {
    console.log("Server is running on port 3000")
});
