import { Router } from "express";
import { 
  expressInterest,
  getMyInterests,
  getClientInterests,
  getUnreadCount,
  markAsRead,
  updateInterestStatus
} from "../controllers/interests.controller";
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

// Middleware to check if user has client role
const requireClientRole = async (req: any, res: any, next: any) => {
  try {
    const userId = req.userId; // Set by verifyToken middleware
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated"
      });
    }

    const user = await UserRepository.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    if (user.role !== 'client') {
      return res.status(403).json({
        success: false,
        message: "Access denied. Client role required."
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Error in requireClientRole middleware:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// Company routes
// POST /interests/express/:clientId - Express interest in a client's project (requires company role)
router.post("/express/:clientId", verifyToken, requireCompanyRole, expressInterest);

// GET /interests/my - Get interests expressed by current company (requires company role)
router.get("/my", verifyToken, requireCompanyRole, getMyInterests);

// Client routes
// GET /interests/received - Get interests received by current client (requires client role)
router.get("/received", verifyToken, requireClientRole, getClientInterests);

// GET /interests/unread-count - Get unread interest count for current client (requires client role)
router.get("/unread-count", verifyToken, requireClientRole, getUnreadCount);

// PATCH /interests/:interestId/read - Mark interest as read (requires client role)
router.patch("/:interestId/read", verifyToken, requireClientRole, markAsRead);

// PATCH /interests/:interestId/status - Update interest status (requires client role)
router.patch("/:interestId/status", verifyToken, requireClientRole, updateInterestStatus);

export default router;