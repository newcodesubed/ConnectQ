import { Request, Response } from "express";
import { CompanyRepository } from "../repository/companies.repository";
import { uploadImage, deleteImage } from "../utils/cloudinary";
import { cleanupTempFile } from "../utils/upload";
import { embedSingleCompany } from "../services/embedding.service";
import logger from "../utils/logger";

export const createCompany = async (req: Request, res: Response) => {
  try {
    const { 
      name, 
      email, 
      description, 
      industry, 
      location, 
      contactNumber,
      // Branding (logoUrl will be handled separately through file upload)
      website,
      tagline,
      foundedAt,
      // Offerings
      services,
      technologiesUsed,
      costRange,
      deliveryDuration,
      specializations,
      // Scale
      employeeCount,
      // Reputation
      reviews,
      // Social Links
      linkedinUrl,
      twitterUrl
    } = req.body;
    const userId = (req as any).userId; // From auth middleware

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

    // Handle logo upload if file is present
    let logoUrl = null;
    if (req.file) {
      const uploadResult = await uploadImage(req.file.path, 'companies/logos');
      if (uploadResult) {
        logoUrl = uploadResult.url;
      } else {
        // Clean up temp file if upload failed
        cleanupTempFile(req.file.path);
        return res.status(500).json({
          success: false,
          message: "Failed to upload logo image"
        });
      }
    }

    // Parse array fields if they come as strings
    const parsedServices = typeof services === 'string' ? JSON.parse(services) : services;
    const parsedTechnologiesUsed = typeof technologiesUsed === 'string' ? JSON.parse(technologiesUsed) : technologiesUsed;
    const parsedSpecializations = typeof specializations === 'string' ? JSON.parse(specializations) : specializations;
    const parsedReviews = typeof reviews === 'string' ? JSON.parse(reviews) : reviews;

    // Create company data object
    const companyData: any = {
      userId,
      name,
      email,
      description,
      industry,
      location,
      contactNumber,
      logoUrl,
      website,
      tagline,
      foundedAt: foundedAt ? new Date(foundedAt) : undefined,
      services: parsedServices,
      technologiesUsed: parsedTechnologiesUsed,
      costRange,
      deliveryDuration,
      specializations: parsedSpecializations,
      employeeCount: employeeCount ? parseInt(employeeCount) : undefined,
      reviews: parsedReviews,
      linkedinUrl,
      twitterUrl
    };

    // Remove undefined fields to avoid inserting null values
    Object.keys(companyData).forEach(key => {
      if (companyData[key] === undefined) {
        delete companyData[key];
      }
    });

    const newCompany = await CompanyRepository.create(companyData);

    logger.info(`Company created successfully: ${newCompany.name} by user ${userId}`);

    // Automatically embed the new company in the background
    embedSingleCompany(newCompany.id)
      .then((result) => {
        if (result.success) {
          logger.info(`Company embedding successful: ${newCompany.name} (${newCompany.id})`);
        } else {
          logger.warn(`Company embedding failed: ${newCompany.name} (${newCompany.id}) - ${result.message}`);
        }
      })
      .catch((error) => {
        logger.error(`Company embedding error: ${newCompany.name} (${newCompany.id})`, error);
      });

    res.status(201).json({
      success: true,
      message: "Company created successfully",
      company: newCompany
    });
  } catch (error: any) {
    // Clean up temp file if it exists
    if (req.file) {
      cleanupTempFile(req.file.path);
    }
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
    const { 
      name, 
      email, 
      description, 
      industry, 
      location, 
      contactNumber,
      // Branding (logoUrl will be handled separately through file upload)
      website,
      tagline,
      foundedAt,
      // Offerings
      services,
      technologiesUsed,
      costRange,
      deliveryDuration,
      specializations,
      // Scale
      employeeCount,
      // Reputation
      reviews,
      // Social Links
      linkedinUrl,
      twitterUrl
    } = req.body;

    // Check if company exists and user owns it
    const existingCompany = await CompanyRepository.findById(id);
    
    if (!existingCompany) {
      // Clean up temp file if upload was attempted
      if (req.file) {
        cleanupTempFile(req.file.path);
      }
      return res.status(404).json({
        success: false,
        message: "Company not found"
      });
    }

    if (existingCompany.userId !== userId) {
      // Clean up temp file if upload was attempted
      if (req.file) {
        cleanupTempFile(req.file.path);
      }
      return res.status(403).json({
        success: false,
        message: "Access denied. You can only update your own company."
      });
    }

    // Handle logo upload if file is present
    let logoUrl = existingCompany.logoUrl; // Keep existing logo by default
    if (req.file) {
      const uploadResult = await uploadImage(req.file.path, 'companies/logos');
      if (uploadResult) {
        logoUrl = uploadResult.url;
        
        // Delete old logo from Cloudinary if it exists
        if (existingCompany.logoUrl) {
          // Extract public_id from the URL and delete
          const urlParts = existingCompany.logoUrl.split('/');
          const publicIdWithExtension = urlParts.slice(-2).join('/'); // folder/filename
          const publicId = publicIdWithExtension.split('.')[0]; // remove extension
          await deleteImage(publicId);
        }
      } else {
        cleanupTempFile(req.file.path);
        return res.status(500).json({
          success: false,
          message: "Failed to upload logo image"
        });
      }
    }

    // Parse array fields if they come as strings
    const parsedServices = typeof services === 'string' ? JSON.parse(services) : services;
    const parsedTechnologiesUsed = typeof technologiesUsed === 'string' ? JSON.parse(technologiesUsed) : technologiesUsed;
    const parsedSpecializations = typeof specializations === 'string' ? JSON.parse(specializations) : specializations;
    const parsedReviews = typeof reviews === 'string' ? JSON.parse(reviews) : reviews;

    // Prepare update data (only include provided fields)
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (description !== undefined) updateData.description = description;
    if (industry !== undefined) updateData.industry = industry;
    if (location !== undefined) updateData.location = location;
    if (contactNumber !== undefined) updateData.contactNumber = contactNumber;
    // Branding
    if (req.file || logoUrl !== existingCompany.logoUrl) updateData.logoUrl = logoUrl;
    if (website !== undefined) updateData.website = website;
    if (tagline !== undefined) updateData.tagline = tagline;
    if (foundedAt !== undefined) updateData.foundedAt = foundedAt ? new Date(foundedAt) : null;
    // Offerings
    if (services !== undefined) updateData.services = parsedServices;
    if (technologiesUsed !== undefined) updateData.technologiesUsed = parsedTechnologiesUsed;
    if (costRange !== undefined) updateData.costRange = costRange;
    if (deliveryDuration !== undefined) updateData.deliveryDuration = deliveryDuration;
    if (specializations !== undefined) updateData.specializations = parsedSpecializations;
    // Scale
    if (employeeCount !== undefined) updateData.employeeCount = employeeCount ? parseInt(employeeCount) : null;
    // Reputation
    if (reviews !== undefined) updateData.reviews = parsedReviews;
    // Social Links
    if (linkedinUrl !== undefined) updateData.linkedinUrl = linkedinUrl;
    if (twitterUrl !== undefined) updateData.twitterUrl = twitterUrl;

    const updatedCompany = await CompanyRepository.update(id, updateData);

    if (!updatedCompany) {
      return res.status(500).json({
        success: false,
        message: "Failed to update company"
      });
    }

    logger.info(`Company updated successfully: ${updatedCompany.name} by user ${userId}`);

    // Automatically re-embed the updated company in the background
    embedSingleCompany(updatedCompany.id)
      .then((result) => {
        if (result.success) {
          logger.info(`Company re-embedding successful: ${updatedCompany.name} (${updatedCompany.id})`);
        } else {
          logger.warn(`Company re-embedding failed: ${updatedCompany.name} (${updatedCompany.id}) - ${result.message}`);
        }
      })
      .catch((error) => {
        logger.error(`Company re-embedding error: ${updatedCompany.name} (${updatedCompany.id})`, error);
      });

    res.status(200).json({
      success: true,
      message: "Company updated successfully",
      company: updatedCompany
    });
  } catch (error: any) {
    // Clean up temp file if it exists
    if (req.file) {
      cleanupTempFile(req.file.path);
    }
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
