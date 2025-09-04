# Multer Setup for Company Image Upload

This guide will help you set up Multer for uploading company images in your ConnectQ backend application.

## Overview

We'll set up:
- Multer for handling file uploads
- File storage configuration
- Upload middleware
- Company image upload route
- Integration with your existing company model

## Prerequisites

- Node.js backend with Express
- Companies table with `imgPath` field
- File system access for storing images

## Step 1: Install Dependencies

```bash
cd backend
npm install multer
npm install --save-dev @types/multer
```

## Step 2: Create Upload Configuration

Create `backend/src/utils/upload.ts`:

```typescript
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Request } from 'express';

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '../../uploads/companies');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Storage configuration
const storage = multer.diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb) => {
    cb(null, uploadDir);
  },
  filename: (req: Request, file: Express.Multer.File, cb) => {
    // Generate unique filename: companyId_timestamp_originalname
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    const basename = path.basename(file.originalname, extension);
    cb(null, `${req.params.companyId}_${uniqueSuffix}_${basename}${extension}`);
  }
});

// File filter for images only
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'));
  }
};

// Upload configuration
export const uploadCompanyImage = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  }
}).single('companyImage'); // 'companyImage' is the field name in the form

// Helper function to get file URL
export const getCompanyImageUrl = (filename: string): string => {
  return `/uploads/companies/${filename}`;
};

// Helper function to delete old image
export const deleteCompanyImage = (filename: string): void => {
  const filePath = path.join(uploadDir, filename);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
};
```

## Step 3: Create Upload Middleware

Create `backend/src/middlewares/upload.middleware.ts`:

```typescript
import { Request, Response, NextFunction } from 'express';
import { uploadCompanyImage } from '../utils/upload';

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
```

## Step 4: Update Company Model

Update your company model to handle image operations. Assuming you have `backend/src/db/companies.ts`:

```typescript
import { db } from '../db';
import { companies } from './companies.schema';
import { eq } from 'drizzle-orm';
import { deleteCompanyImage, getCompanyImageUrl } from '../utils/upload';

export const CompanyModel = {
  // ... existing methods ...

  async updateImage(companyId: string, imageFilename: string) {
    // Get current company to delete old image if exists
    const existingCompany = await this.findById(companyId);
    if (existingCompany && existingCompany.imgPath) {
      deleteCompanyImage(existingCompany.imgPath);
    }

    // Update company with new image path
    const result = await db
      .update(companies)
      .set({ imgPath: imageFilename })
      .where(eq(companies.id, companyId))
      .returning();

    return result[0] || null;
  },

  async deleteImage(companyId: string) {
    const company = await this.findById(companyId);
    if (company && company.imgPath) {
      deleteCompanyImage(company.imgPath);

      // Remove image path from database
      await db
        .update(companies)
        .set({ imgPath: null })
        .where(eq(companies.id, companyId));
    }
  },

  // Helper method to get company with full image URL
  async findByIdWithImageUrl(id: string) {
    const company = await this.findById(id);
    if (company && company.imgPath) {
      return {
        ...company,
        imageUrl: getCompanyImageUrl(company.imgPath)
      };
    }
    return company;
  }
};
```

## Step 5: Create Company Routes

Create or update `backend/src/routes/companies.routes.ts`:

```typescript
import { Router } from 'express';
import { handleCompanyImageUpload } from '../middlewares/upload.middleware';
import { CompanyModel } from '../db/companies';

const router = Router();

// Upload company image
router.post('/:companyId/upload-image', handleCompanyImageUpload, async (req, res) => {
  try {
    const { companyId } = req.params;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided'
      });
    }

    // Update company with new image
    const updatedCompany = await CompanyModel.updateImage(companyId, req.file.filename);

    if (!updatedCompany) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Company image uploaded successfully',
      company: updatedCompany
    });
  } catch (error) {
    console.error('Error uploading company image:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Delete company image
router.delete('/:companyId/image', async (req, res) => {
  try {
    const { companyId } = req.params;

    await CompanyModel.deleteImage(companyId);

    res.status(200).json({
      success: true,
      message: 'Company image deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting company image:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get company with image URL
router.get('/:companyId', async (req, res) => {
  try {
    const { companyId } = req.params;

    const company = await CompanyModel.findByIdWithImageUrl(companyId);

    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }

    res.status(200).json({
      success: true,
      company
    });
  } catch (error) {
    console.error('Error fetching company:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

export default router;
```

## Step 6: Update Main App File

Update your main Express app (likely `backend/src/index.ts`) to serve static files and use the routes:

```typescript
import express from 'express';
import path from 'path';
import companiesRoutes from './routes/companies.routes';
// ... other imports ...

const app = express();

// ... existing middleware ...

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ... existing routes ...

// Company routes
app.use('/api/companies', companiesRoutes);

// ... rest of app setup ...
```

## Step 7: Update Frontend (Optional)

If you want to upload from your frontend, here's an example:

```javascript
// In your React/Vue component
const uploadCompanyImage = async (companyId, imageFile) => {
  const formData = new FormData();
  formData.append('companyImage', imageFile);

  const response = await fetch(`/api/companies/${companyId}/upload-image`, {
    method: 'POST',
    body: formData,
  });

  const result = await response.json();
  return result;
};
```

## Step 8: Environment Configuration

Add to your `.env` file:

```env
# Maximum file size for uploads (in bytes)
MAX_FILE_SIZE=5242880  # 5MB

# Allowed file types
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/gif,image/webp
```

## Step 9: Testing

### Test File Upload:
```bash
curl -X POST \
  -F "companyImage=@/path/to/your/image.jpg" \
  http://localhost:5000/api/companies/{companyId}/upload-image
```

### Test Image Access:
```
GET http://localhost:5000/uploads/companies/{filename}
```

## File Structure After Setup

```
backend/
├── src/
│   ├── routes/
│   │   └── companies.routes.ts
│   ├── middlewares/
│   │   └── upload.middleware.ts
│   ├── utils/
│   │   └── upload.ts
│   ├── db/
│   │   ├── companies.ts (updated)
│   │   └── companies.schema.ts
│   └── uploads/
│       └── companies/
│           └── (uploaded images)
```

## Security Considerations

1. **File Type Validation**: Only allow specific image formats
2. **File Size Limits**: Prevent large file uploads
3. **Storage Limits**: Monitor disk usage
4. **Access Control**: Ensure users can only upload to their own companies
5. **File Name Sanitization**: Prevent path traversal attacks

## Error Handling

The setup includes comprehensive error handling for:
- File size limits
- Invalid file types
- Upload failures
- Missing files
- Database errors

## Next Steps

1. Implement authentication middleware to ensure users can only upload to their companies
2. Add image resizing/optimization for better performance
3. Implement image thumbnails
4. Add cloud storage integration (AWS S3, Cloudinary) for production
5. Add image validation (dimensions, content)

This setup provides a solid foundation for company image uploads with proper error handling and security measures.
