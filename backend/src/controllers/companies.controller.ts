import { Request, Response } from "express";
import { CompanyRepository } from "../repository/companies.repository";
import logger from "../utils/logger";

export const createCompany = async (req: Request, res: Response) => {
  try {
    const { name, email, description, industry, location, contactNumber } = req.body;
    const userId = (req as any).userId; // From auth middleware

    // Role check is now done in middleware, so we can skip it here
    // The user data is also available in req.user if needed

    // Validate required fields
    if (!name || !email) {
      return res.status(400).json({ 
        success: false, 
        message: "Company name and email are required" 
      });
    }

    // Check if user already has a company
    const existingCompany = await CompanyRepository.findByUserId(userId);
    if (existingCompany) {
      return res.status(400).json({
        success: false,
        message: "User already has a company"
      });
    }

    // Create company
    const companyData = {
      userId,
      name,
      email,
      description,
      industry,
      location,
      contactNumber
    };

    const newCompany = await CompanyRepository.create(companyData);

    logger.info(`Company created successfully: ${newCompany.name} by user ${userId}`);

    res.status(201).json({
      success: true,
      message: "Company created successfully",
      company: newCompany
    });
  } catch (error: any) {
    logger.error("Error creating company:", error);
    res.status(500).json({ 
      success: false, 
      message: "Internal server error" 
    });
  }
};

export const getCompany = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).userId;

    const company = await CompanyRepository.findById(id);

    if (!company) {
      return res.status(404).json({
        success: false,
        message: "Company not found"
      });
    }

    // Check if user owns the company
    if (company.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: "Access denied. You can only view your own company."
      });
    }

    res.status(200).json({
      success: true,
      company
    });
  } catch (error: any) {
    logger.error("Error fetching company:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

export const updateCompany = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).userId;
    const { name, email, description, industry, location, contactNumber } = req.body;

    // Check if company exists and user owns it
    const existingCompany = await CompanyRepository.findById(id);
    
    if (!existingCompany) {
      return res.status(404).json({
        success: false,
        message: "Company not found"
      });
    }

    if (existingCompany.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: "Access denied. You can only update your own company."
      });
    }

    // Prepare update data (only include provided fields)
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (description !== undefined) updateData.description = description;
    if (industry !== undefined) updateData.industry = industry;
    if (location !== undefined) updateData.location = location;
    if (contactNumber !== undefined) updateData.contactNumber = contactNumber;

    const updatedCompany = await CompanyRepository.update(id, updateData);

    if (!updatedCompany) {
      return res.status(500).json({
        success: false,
        message: "Failed to update company"
      });
    }

    logger.info(`Company updated successfully: ${updatedCompany.name} by user ${userId}`);

    res.status(200).json({
      success: true,
      message: "Company updated successfully",
      company: updatedCompany
    });
  } catch (error: any) {
    logger.error("Error updating company:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

export const getMyCompany = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;

    const company = await CompanyRepository.findByUserId(userId);

    if (!company) {
      return res.status(404).json({
        success: false,
        message: "No company found for this user"
      });
    }

    res.status(200).json({
      success: true,
      company
    });
  } catch (error: any) {
    logger.error("Error fetching user's company:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};
