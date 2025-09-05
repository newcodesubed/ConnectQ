// Require the cloudinary library
import { v2 as cloudinary} from "cloudinary";
import fs from "fs";
import dotenv from "dotenv";
dotenv.config();
console.log(process.env.CLOUDINARY_CLOUD_NAME);
// Return "https" URLs by setting secure: true
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

// Log the configuration
console.log('Cloudinary configured:', {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY ? 'Set' : 'Not set'
});

export const uploadImage = async (imagePath: string, folder: string = 'companies') => {
    // Use the uploaded file's name as the asset's public ID and 
    // allow overwriting the asset with new versions
    const options = {
      use_filename: true,
      unique_filename: true,
      overwrite: false,
      folder: folder, // Organize images in folders
      resource_type: "auto" as const,
    };

    try {
      // Upload the image
      const result = await cloudinary.uploader.upload(imagePath, options);
      console.log('Cloudinary upload result:', result.secure_url);
      
      // Clean up local file after successful upload
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
      
      return {
        url: result.secure_url,
        publicId: result.public_id
      };
    } catch (error) {
        console.error('Cloudinary upload error:', error);
        // Clean up local file on error
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
        return null;
    }
};

export const deleteImage = async (publicId: string) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    console.log('Cloudinary delete result:', result);
    return result.result === 'ok';
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    return false;
  }
};