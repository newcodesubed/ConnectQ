import { Request, Response, NextFunction } from 'express';
import { uploadCompanyImage } from '../utils/upload';
import multer from 'multer';

export const handleCompanyImageUpload = (req: Request, res: Response, next: NextFunction) => {
  uploadCompanyImage(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      // A Multer error occurred when uploading
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          message: 'File too large. Maximum size is 5MB.'
        });
      }
      return res.status(400).json({
        success: false,
        message: 'File upload error: ' + err.message
      });
    } else if (err) {
      // An unknown error occurred
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }

    // Everything went fine
    next();
  });
};