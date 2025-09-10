import { Router } from "express";
import { 
  createClient, 
  getClient, 
  updateClient, 
  getMyClient, 
  deleteClient, 
  getOpenRequests, 
  updateClientStatus 
} from "../controllers/clients.controller";
import { verifyToken } from "../middlewares/verifyToken";
import { uploadClientProfile } from "../utils/upload";
import { UserRepository } from "../repository/user.repository";

const router = Router();

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

    // Fetch user from database to check role
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

    // Attach user data to request for use in controllers
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

// Middleware for allowing both client and company roles (for browsing open requests)
const requireClientOrCompanyRole = async (req: any, res: any, next: any) => {
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

    if (user.role !== 'client' && user.role !== 'company') {
      return res.status(403).json({
        success: false,
        message: "Access denied. Client or Company role required."
      });
    }

    // Attach user data to request for use in controllers
    req.user = user;
    next();
  } catch (error) {
    console.error("Error in requireClientOrCompanyRole middleware:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// Error handling middleware for multer
const handleMulterError = (error: any, req: any, res: any, next: any) => {
  if (error instanceof Error) {
    if (error.message.includes('Only image files')) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
    if (error.message.includes('File too large')) {
      return res.status(400).json({
        success: false,
        message: "File size too large. Maximum size is 5MB."
      });
    }
  }
  return res.status(500).json({
    success: false,
    message: "File upload error"
  });
};

// POST /clients - Create new client profile (requires client role, supports file upload)
router.post("/", verifyToken, requireClientRole, uploadClientProfile, handleMulterError, createClient);

// GET /clients/me - Get current user's client profile (requires client role)
router.get("/me", verifyToken, requireClientRole, getMyClient);

// GET /clients/open-requests - Get all open client requests (for companies to browse)
router.get("/open-requests", verifyToken, requireClientOrCompanyRole, getOpenRequests);

// GET /clients/:id - Get specific client profile (requires client role)
router.get("/:id", verifyToken, requireClientRole, getClient);

// PUT /clients/:id - Update client profile (requires client role, supports file upload)
router.put("/:id", verifyToken, requireClientRole, uploadClientProfile, handleMulterError, updateClient);

// PATCH /clients/:id/status - Update client request status (requires client role)
router.patch("/:id/status", verifyToken, requireClientRole, updateClientStatus);

// DELETE /clients/:id - Delete client profile (requires client role)
router.delete("/:id", verifyToken, requireClientRole, deleteClient);

export default router;
