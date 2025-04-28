import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User";

export const loginUser = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "User not found with this email" });
        }

        // Check password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ message: "Invalid password" });
        }

        // Generate token
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || 'secret', {
            expiresIn: '7d'
        });

        // Return user info with token
        res.status(200).json({
            token,
            userId: user._id,
            name: user.firstName + ' ' + user.lastName,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email
        });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: "Error during login" });
    }
};