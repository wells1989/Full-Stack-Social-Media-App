import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

/* register route*/

export const register = async (req, res) => {
    try {
        const {
            firstName,
            lastName,
            email,
            password,
            picturePath,
            friends,
            location,
            occupation
        } = req.body; // i.e. firstName const = req.body.firstName etc
    
    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(password, salt);
    
    const newUser = new User({
        firstName,
        lastName,
        email,
        password: passwordHash,
        picturePath,
        friends,
        location,
        occupation,
        viewedProfile: Math.floor(Math.random() * 10000), // dummy data
        impressions: Math.floor(Math.random() * 10000), // dummy data
    });
    // newUser uses new variables defined above

    const savedUser = await newUser.save();
    res.status(201).json(savedUser);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// logging in

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        const user = await User.findOne({ email: email });
        if (!user) return res.status(400).json({ msg: "User does not exist."});

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ msg: "Password does not match"});

        const token = jwt.sign({
            id: user._id
        }, process.env.JWT_SECRET);
        delete user.password;

        res.status(200).json({ token, user });
    }
    catch(err) {
        res.status(500).json({ error: err.message });
    }
}