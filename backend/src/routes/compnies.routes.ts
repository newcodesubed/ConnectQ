import { Router } from "express";
import { createCompany, getCompany, updateCompany, getMyCompany } from "../controllers/companies.controller";
import { verifyToken } from "../middlewares/verifyToken";
import { UserRepository } from "../repository/user.repository";

const router = Router();

// Middleware to check if user has company role
const requireCompanyRole = async (req: any, res: any, next: any) => {
  try {
    const userId = req.userId; // Set by verifyToken middleware
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated"
      });
    }

    // Fetch user from database to check role
    const user = await UserRepository.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    if (user.role !== 'company') {
      return res.status(403).json({
        success: false,
        message: "Access denied. Company role required."
      });
    }

    // Attach user data to request for use in controllers
    req.user = user;
    next();
  } catch (error) {
    console.error("Error in requireCompanyRole middleware:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// POST /companies - Create new company (requires company role)
router.post("/", verifyToken, requireCompanyRole, createCompany);

// GET /companies/me - Get current user's company (requires company role)
router.get("/me", verifyToken, requireCompanyRole, getMyCompany);

// GET /companies/:id - Get specific company (requires company role)
router.get("/:id", verifyToken, requireCompanyRole, getCompany);

// PUT /companies/:id - Update company (requires company role)
router.put("/:id", verifyToken, requireCompanyRole, updateCompany);

export default router;