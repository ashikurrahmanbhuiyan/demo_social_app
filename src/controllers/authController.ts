import { Request, Response } from "express";
import User from "../models/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET as string;


// Render Login Page
export const getLogin = (req: Request, res: Response) => {
    res.render("login", { error: null });
};

// Render Register Page
export const getRegister = (req: Request, res: Response) => {
    res.render("register", { error: null });
};

// Handle User Registration
export const postRegister = async (req: Request, res: Response) => {
    const { username, password } = req.body;

    try {
        const userExists = await User.findOne({ username });
        if (userExists) return res.render("register", { error: "User already exists" });

        const newUser = new User({ username, password });
        await newUser.save();
        res.redirect("/login");
    } catch (error) {
        res.render("register", { error: "Something went wrong" });
    }
};

// Handle User Login
export const postLogin = async (req: Request, res: Response) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ username });
        if (!user) return res.render("login", { error: "Invalid credentials" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.render("login", { error: "Invalid credentials" });

        const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: "1h" });
        res.cookie("token", token, { httpOnly: true });
        res.redirect("/dashboard");
    } catch (error) {
        res.render("login", { error: "Something went wrong" });
    }
};

// Handle Dashboard
export const getDashboard = (req: Request, res: Response) => {
    res.render("dashboard");
};

// Handle Logout
export const logout = (req: Request, res: Response) => {
    res.clearCookie("token");
    res.redirect("/login");
};
