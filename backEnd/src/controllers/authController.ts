import { Request, Response } from "express";
import User from "../models/UserModel";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// ===== Brute Force Protection =====
const loginAttempts: Record<string, { count: number; lastAttempt: number }> =
  {};

function checkBruteForce(email: string): number {
  const now = Date.now();
  if (!loginAttempts[email])
    loginAttempts[email] = { count: 0, lastAttempt: now };
  const entry = loginAttempts[email];
  // reset after 5 minutes
  if (now - entry.lastAttempt > 5 * 60 * 1000) entry.count = 0;
  entry.lastAttempt = now;
  entry.count++;
  return entry.count;
}

// ===== REGISTER =====
export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password, confirmPassword } = req.body;

    // 1. required fields
    if (!name || !email || !password || !confirmPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // 2. name length
    if (name.trim().length < 2) {
      return res
        .status(400)
        .json({ message: "Name must be at least 2 characters" });
    }

    // 3. email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    // 4. password length
    if (password.length < 8) {
      return res
        .status(400)
        .json({ message: "Password must be at least 8 characters" });
    }

    // 5. password strength: uppercase + lowercase + number
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      return res.status(400).json({
        message:
          "Password must contain an uppercase letter, a lowercase letter, and a number",
      });
    }

    // 6. confirm password
    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    // 7. duplicate email (case-insensitive)
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({ message: "Email is already registered" });
    }

    // 8. hash password (12 rounds)
    const hashedPassword = await bcrypt.hash(password, 12);

    // 9. create user
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase(),
      password: hashedPassword,
    });

    const { password: _, ...userWithoutPassword } = user.toObject();

    return res.status(201).json({
      message: "Register successful",
      user: userWithoutPassword,
    });
  } catch (error) {
    return res.status(500).json({ message: "Server Error" });
  }
};

// ===== LOGIN =====
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password, rememberMe } = req.body;

    // 1. required fields
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    // 2. brute force check (max 5 attempts, 5-min lockout)
    const attempts = checkBruteForce(email);
    if (attempts > 5) {
      return res.status(429).json({
        message:
          "Too many failed attempts. Please wait 5 minutes and try again.",
      });
    }

    // 3. find user
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // 4. compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // 5. reset attempt counter on success
    if (loginAttempts[email]) loginAttempts[email].count = 0;

    // 6. sign token (30d if rememberMe, else 1d)
    const expiresIn = rememberMe ? "30d" : "1d";
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET as string,
      { expiresIn },
    );

    console.log(token);

    const { password: _, ...userWithoutPassword } = user.toObject();

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      maxAge: rememberMe ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000,
      sameSite: "none",
    });

    return res.status(200).json({
      message: "Login successful",
      token, // still return it for compatibility if needed
      user: userWithoutPassword,
    });
  } catch (error) {
    return res.status(500).json({ message: "Server Error" });
  }
};

// ===== LOGOUT =====
export const logout = (_req: Request, res: Response) => {
  res.clearCookie("token");
  return res.status(200).json({ message: "Logged out successfully" });
};
