import { Router } from "express";
import { checkAuth, forgetPassword, login, logout, resetPassword, signup, verifyEmail } from "../controllers/auth.controller";
import { verifyToken } from "../middlewares/verifyToken";

const router = Router();


router.post("/signup", signup);
router.post("/login", login);
router.post("/verify-email", verifyEmail);
router.post("/logout", logout);
router.post("/forget-password", forgetPassword);
router.post("/reset-password/:token", resetPassword);
router.get("/check-auth", verifyToken, checkAuth);

export default router;
