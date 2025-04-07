import express from "express"
import mongoose from "mongoose"
import userModel from "./models/userSchema.js";
import bcrypt from "bcryptjs";
import cors from "cors"
import "dotenv/config"
const app = express();
const PORT = 3000;

app.use(express.json());
app.use(cors());

const MONGODB_URI = process.env.MONGODB;

mongoose.connect(MONGODB_URI);
mongoose.connection.on("connected", () => {
    console.log('MongoDB connected');
});

mongoose.connection.on("error", (error) => {
    console.log(error);
});
// signup api
app.post('/api/signup', async (req, res) => {
    const { firstName, lastName, email, password } = req.body;

    if (!firstName || !lastName || !email || !password) {
        return res.status(400).json({
            message: "Required fields are missing..."
        });
    }

    const emailExist = await userModel.findOne({ email });
    if (emailExist !== null) {
        return res.status(400).json({
            message: "Email already exists"
        });
    }

    const encryptedPassword = await bcrypt.hash(password, 10);
    console.log(encryptedPassword);

    const obj = {
        firstName,
        lastName,
        email,
        password: encryptedPassword
    };

    const saveData = await userModel.create(obj);
    res.status(200).json({
        message: "Signup successful!",
        saveData,
    });
});

// login api
app.post("/api/login",async(req,res)=>{
    const {email,password}=req.body;
    if(!email||!password){
        res.status(400).json({
            message:"Required fields are missing..."
        })
    }
    const emailExist=await userModel.findOne({email});
    if(!emailExist){
        res.status(400).json({
            message:"Invalid email & password"
        })
    }
    console.log(emailExist);
    const comparePassword =await bcrypt.compare(password,emailExist.password);
    if(!comparePassword){
        res.status(400).json({
            message:"Invalid email & password"
        })
    }
    res.status(200).json({
        message:"Login successful",
    })

    
})

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
