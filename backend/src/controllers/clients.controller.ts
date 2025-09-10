import { Request, Response } from "express";
import { ClientRepository } from "../repository/clients.repository";
import { uploadImage, deleteImage } from "../utils/cloudinary";
import { cleanupTempFile } from "../utils/upload";
import logger from "../utils/logger";

export const createClient = async (req: Request, res: Response) => {
  try {
    const { 
      contactNumber,
      bio,
      description,
      status
    } = req.body;
    const userId = (req as any).userId; // From auth middleware

    // Check if user already has a client profile
    const existingClient = await ClientRepository.findByUserId(userId);
    if (existingClient) {
      return res.status(400).json({
        success: false,
        message: "User already has a client profile"
      });
    }

    // Handle profile picture upload if file is present
    let profilePicUrl = null;
    if (req.file) {
      const uploadResult = await uploadImage(req.file.path, 'clients/profiles');
      if (uploadResult) {
        profilePicUrl = uploadResult.url;
      } else {
        // Clean up temp file if upload failed
        cleanupTempFile(req.file.path);
        return res.status(500).json({
          success: false,
          message: "Failed to upload profile picture"
        });
      }
    }

    // Create client data object
    const clientData: any = {
      userId,
      profilePicUrl,
      contactNumber,
      bio,
      description,
      status: status || 'open' // Default to 'open' status
    };

    // Remove undefined fields to avoid inserting null values
    Object.keys(clientData).forEach(key => {
      if (clientData[key] === undefined) {
        delete clientData[key];
      }
    });

    const newClient = await ClientRepository.create(clientData);

    logger.info(`Client profile created successfully for user ${userId}`);

    res.status(201).json({
      success: true,
      message: "Client profile created successfully",
      client: newClient
    });
  } catch (error: any) {
    // Clean up temp file if it exists
    if (req.file) {
      cleanupTempFile(req.file.path);
    }
    logger.error("Error creating client profile:", error);
    res.status(500).json({ 
      success: false, 
      message: "Internal server error" 
    });
  }
};

export const getClient = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).userId;

    const client = await ClientRepository.findById(id);

    if (!client) {
      return res.status(404).json({
        success: false,
        message: "Client profile not found"
      });
    }

    // Check if user owns the client profile
    if (client.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: "Access denied. You can only view your own client profile."
      });
    }

    res.status(200).json({
      success: true,
      client
    });
  } catch (error: any) {
    logger.error("Error fetching client profile:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

export const updateClient = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).userId;
    const { 
      contactNumber,
      bio,
      description,
      status
    } = req.body;

    // Check if client profile exists and user owns it
    const existingClient = await ClientRepository.findById(id);
    
    if (!existingClient) {
      // Clean up temp file if upload was attempted
      if (req.file) {
        cleanupTempFile(req.file.path);
      }
      return res.status(404).json({
        success: false,
        message: "Client profile not found"
      });
    }

    if (existingClient.userId !== userId) {
      // Clean up temp file if upload was attempted
      if (req.file) {
        cleanupTempFile(req.file.path);
      }
      return res.status(403).json({
        success: false,
        message: "Access denied. You can only update your own client profile."
      });
    }

    // Handle profile picture upload if file is present
    let profilePicUrl = existingClient.profilePicUrl; // Keep existing profile picture by default
    if (req.file) {
      const uploadResult = await uploadImage(req.file.path, 'clients/profiles');
      if (uploadResult) {
        profilePicUrl = uploadResult.url;
        
        // Delete old profile picture from Cloudinary if it exists
        if (existingClient.profilePicUrl) {
          // Extract public_id from the URL and delete
          const urlParts = existingClient.profilePicUrl.split('/');
          const publicIdWithExtension = urlParts.slice(-2).join('/'); // folder/filename
          const publicId = publicIdWithExtension.split('.')[0]; // remove extension
          await deleteImage(publicId);
        }
      } else {
        cleanupTempFile(req.file.path);
        return res.status(500).json({
          success: false,
          message: "Failed to upload profile picture"
        });
      }
    }

    // Prepare update data (only include provided fields)
    const updateData: any = {};
    if (contactNumber !== undefined) updateData.contactNumber = contactNumber;
    if (bio !== undefined) updateData.bio = bio;
    if (description !== undefined) updateData.description = description;
    if (status !== undefined) updateData.status = status;
    if (req.file || profilePicUrl !== existingClient.profilePicUrl) updateData.profilePicUrl = profilePicUrl;

    const updatedClient = await ClientRepository.update(id, updateData);

    if (!updatedClient) {
      return res.status(500).json({
        success: false,
        message: "Failed to update client profile"
      });
    }

    logger.info(`Client profile updated successfully for user ${userId}`);

    res.status(200).json({
      success: true,
      message: "Client profile updated successfully",
      client: updatedClient
    });
  } catch (error: any) {
    // Clean up temp file if it exists
    if (req.file) {
      cleanupTempFile(req.file.path);
    }
    logger.error("Error updating client profile:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

export const getMyClient = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;

    const client = await ClientRepository.findByUserId(userId);

    if (!client) {
      return res.status(404).json({
        success: false,
        message: "No client profile found for this user"
      });
    }

    res.status(200).json({
      success: true,
      client
    });
  } catch (error: any) {
    logger.error("Error fetching user's client profile:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

export const deleteClient = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).userId;

    // Check if client profile exists and user owns it
    const existingClient = await ClientRepository.findById(id);
    
    if (!existingClient) {
      return res.status(404).json({
        success: false,
        message: "Client profile not found"
      });
    }

    if (existingClient.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: "Access denied. You can only delete your own client profile."
      });
    }

    // Delete profile picture from Cloudinary if it exists
    if (existingClient.profilePicUrl) {
      const urlParts = existingClient.profilePicUrl.split('/');
      const publicIdWithExtension = urlParts.slice(-2).join('/'); // folder/filename
      const publicId = publicIdWithExtension.split('.')[0]; // remove extension
      await deleteImage(publicId);
    }

    await ClientRepository.delete(id);

    logger.info(`Client profile deleted successfully for user ${userId}`);

    res.status(200).json({
      success: true,
      message: "Client profile deleted successfully"
    });
  } catch (error: any) {
    logger.error("Error deleting client profile:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// Get all open client requests (for companies to browse)
export const getOpenRequests = async (req: Request, res: Response) => {
  try {
    const openRequests = await ClientRepository.findOpenRequests();

    res.status(200).json({
      success: true,
      requests: openRequests,
      count: openRequests.length
    });
  } catch (error: any) {
    logger.error("Error fetching open client requests:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// Update client request status
export const updateClientStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = (req as any).userId;

    // Validate status
    const validStatuses = ['open', 'matched', 'closed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Must be one of: open, matched, closed"
      });
    }

    // Check if client profile exists and user owns it
    const existingClient = await ClientRepository.findById(id);
    
    if (!existingClient) {
      return res.status(404).json({
        success: false,
        message: "Client profile not found"
      });
    }

    if (existingClient.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: "Access denied. You can only update your own client profile."
      });
    }

    const updatedClient = await ClientRepository.update(id, { status });

    if (!updatedClient) {
      return res.status(500).json({
        success: false,
        message: "Failed to update client status"
      });
    }

    logger.info(`Client status updated to ${status} for user ${userId}`);

    res.status(200).json({
      success: true,
      message: `Client status updated to ${status}`,
      client: updatedClient
    });
  } catch (error: any) {
    logger.error("Error updating client status:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};
