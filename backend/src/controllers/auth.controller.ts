import bcrypt from "bcryptjs";
import { Request, Response } from "express";
import { UserModel } from "../models/user.model";
import { generateTokenAndSetCookie } from "../utils/generateTokenAndSetCookie";
import { sendVerificationEmail } from "../utils/email";


export const signup = async (req: Request, res: Response) => {
  const { email, password, name, role } = req.body;

  try {
    if (!email || !password || !name || !role) {
      return res.status(400).json({ success: false, message: "All fields required" });
    }

    const existingUser = await UserModel.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ success: false, message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();

    const user = await UserModel.create({
      email,
      password: hashedPassword,
      name,
      role,
      verification_token: verificationToken,
      verification_expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });

    generateTokenAndSetCookie(res, user.id);

    await sendVerificationEmail(user.email, verificationToken);

    res.status(201).json({ success: true, message: "User created successfully", user: { ...user, password: undefined } });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
