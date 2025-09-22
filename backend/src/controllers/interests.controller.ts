import { Request, Response } from "express";
import { InterestRepository } from "../repository/interests.repository";
import { CompanyRepository } from "../repository/companies.repository";
import { ClientRepository } from "../repository/clients.repository";
import logger from "../utils/logger";

export const expressInterest = async (req: Request, res: Response) => {
  try {
    const { clientId } = req.params;
    const { message } = req.body;
    const userId = (req as any).userId; // From auth middleware

    // Get the company for this user
    const company = await CompanyRepository.findByUserId(userId);
    if (!company) {
      return res.status(404).json({
        success: false,
        message: "Company profile not found"
      });
    }

    // Check if client exists and is open
    const client = await ClientRepository.findById(clientId);
    if (!client) {
      return res.status(404).json({
        success: false,
        message: "Client not found"
      });
    }

    if (client.status !== 'open') {
      return res.status(400).json({
        success: false,
        message: "This client request is no longer open"
      });
    }

    // Check if company already expressed interest
    const existingInterest = await InterestRepository.findExisting(clientId, company.id);
    if (existingInterest) {
      return res.status(400).json({
        success: false,
        message: "You have already expressed interest in this project"
      });
    }

    // Create new interest
    const newInterest = await InterestRepository.create({
      clientId,
      companyId: company.id,
      message: message || null,
      status: 'pending'
    });

    logger.info(`Company ${company.name} expressed interest in client ${clientId}`);

    res.status(201).json({
      success: true,
      message: "Interest expressed successfully!",
      interest: newInterest
    });
  } catch (error: any) {
    logger.error("Error expressing interest:", error);
    res.status(500).json({ 
      success: false, 
      message: "Internal server error" 
    });
  }
};

export const getMyInterests = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    
    // Get the company for this user
    const company = await CompanyRepository.findByUserId(userId);
    if (!company) {
      return res.status(404).json({
        success: false,
        message: "Company profile not found"
      });
    }

    const interests = await InterestRepository.findByCompanyId(company.id);

    res.status(200).json({
      success: true,
      interests,
      count: interests.length
    });
  } catch (error: any) {
    logger.error("Error fetching company interests:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

export const getClientInterests = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;

    // Get the client for this user
    const client = await ClientRepository.findByUserId(userId);
    if (!client) {
      return res.status(404).json({
        success: false,
        message: "Client profile not found"
      });
    }

    const interests = await InterestRepository.findByClientId(client.id);

    res.status(200).json({
      success: true,
      interests,
      count: interests.length
    });
  } catch (error: any) {
    logger.error("Error fetching client interests:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

export const getUnreadCount = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;

    // Get the client for this user
    const client = await ClientRepository.findByUserId(userId);
    if (!client) {
      return res.status(404).json({
        success: false,
        message: "Client profile not found"
      });
    }

    const count = await InterestRepository.getUnreadCount(client.id);

    res.status(200).json({
      success: true,
      unreadCount: count
    });
  } catch (error: any) {
    logger.error("Error fetching unread count:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

export const markAsRead = async (req: Request, res: Response) => {
  try {
    const { interestId } = req.params;
    const userId = (req as any).userId;

    // Get the client for this user to verify ownership
    const client = await ClientRepository.findByUserId(userId);
    if (!client) {
      return res.status(404).json({
        success: false,
        message: "Client profile not found"
      });
    }

    const updatedInterest = await InterestRepository.markAsRead(interestId);
    if (!updatedInterest) {
      return res.status(404).json({
        success: false,
        message: "Interest not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Interest marked as read",
      interest: updatedInterest
    });
  } catch (error: any) {
    logger.error("Error marking interest as read:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

export const updateInterestStatus = async (req: Request, res: Response) => {
  try {
    const { interestId } = req.params;
    const { status } = req.body;
    const userId = (req as any).userId;

    // Validate status
    const validStatuses = ['pending', 'accepted', 'rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Must be one of: pending, accepted, rejected"
      });
    }

    // Get the client for this user to verify ownership
    const client = await ClientRepository.findByUserId(userId);
    if (!client) {
      return res.status(404).json({
        success: false,
        message: "Client profile not found"
      });
    }

    const updatedInterest = await InterestRepository.updateStatus(interestId, status);
    if (!updatedInterest) {
      return res.status(404).json({
        success: false,
        message: "Interest not found"
      });
    }

    logger.info(`Interest ${interestId} status updated to ${status} by client ${client.id}`);

    res.status(200).json({
      success: true,
      message: `Interest ${status} successfully`,
      interest: updatedInterest
    });
  } catch (error: any) {
    logger.error("Error updating interest status:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};