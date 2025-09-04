import bcrypt from "bcryptjs";
import { Request, Response } from "express";
import { UserRepository } from "../repository/user.repository";
import { generateTokenAndSetCookie } from "../utils/generateTokenAndSetCookie";
import { sendPasswordResetEmail, sendResetSuccessEmail, sendVerificationEmail, sendWelcomeEmail } from "../utils/email";
import crypto from "crypto";
import logger from "../utils/logger";
         

export const signup = async (req: Request, res: Response) => {
  const { email, password, name, role } = req.body;

  try {
    if (!email || !password || !name || !role) {
      return res.status(400).json({ success: false, message: "All fields required" });
    }

    const existingUser = await UserRepository.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ success: false, message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();

    const user = await UserRepository.create({
      email,
      password: hashedPassword,
      name,
      role,
      verificationToken: verificationToken,
      verificationExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });

    generateTokenAndSetCookie(res, user.id);

    await sendVerificationEmail(user.email, verificationToken);

    logger.info(`User signed up successfully: ${user.email}`);

    res.status(201).json({ success: true, message: "User created successfully", user: { ...user, password: undefined } });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const verifyEmail = async (req: Request, res: Response) => {
  const { code } = req.body;

  try {
    const user = await UserRepository.verifyUser(code);

    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid or expired code" });
    }

    await sendWelcomeEmail(user.email, user.name, `${process.env.CLIENT_URL}/login`);

    logger.info(`Email verified successfully for user: ${user.email}`);

    res.status(200).json({
      success: true,
      message: "Email verified successfully",
      user: { ...user, password: undefined },
    });
  } catch (error: any) {
    logger.error("Error in verifyEmail:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const user = await UserRepository.findByEmail(email);

    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid email" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      logger.error(`Invalid password attempt for user: ${user.email}`);
      return res.status(400).json({ success: false, message: "Invalid password" });

    }

    generateTokenAndSetCookie(res, user.id);

    // update last login
    await UserRepository.updateLastLogin(user.id);

    logger.info(`User logged in: ${user.email}`);

    res.status(200).json({
      success: true,
      message: "Login successful",
      user: { ...user, password: undefined },
    });
  } catch (error: any) {
    logger.error("Error in login:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
export const logout = (req: Request, res: Response) => {
  res.clearCookie("token");
  res.status(200).json({ success: true, message: "Logout successful" });
};

export const forgetPassword = async (req: Request, res: Response) => {
  const { email } = req.body;

  try {
    const user = await UserRepository.findByEmail(email);

    if (!user) {
      return res.status(400).json({ success: false, message: "User not found" });
    }

    const resetToken = crypto.randomBytes(20).toString("hex");
    const resetTokenExpiration = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await UserRepository.setResetToken(user.id, resetToken, resetTokenExpiration);

    await sendPasswordResetEmail(user.email, `${process.env.CLIENT_URL}/reset-password/${resetToken}`);

    res.status(200).json({ success: true, message: "Password reset email sent" });
  } catch (error: any) {
    logger.error("Error in forgetPassword:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};


export const resetPassword = async (req: Request, res: Response) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    const user = await UserRepository.findByResetToken(token);

    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid or expired reset token" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await UserRepository.updatePassword(user.id, hashedPassword);

    await sendResetSuccessEmail(user.email);

    res.status(200).json({ success: true, message: "Password reset successfully" });
  } catch (error: any) {
    logger.error("Error in resetPassword:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const checkAuth = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const user = await UserRepository.findById(userId);

    logger.info(`Auth check for user ID: ${userId}`);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({ success: true, user: { ...user, password: undefined } });
  } catch (error: any) {
    logger.error("Error in checkAuth:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
