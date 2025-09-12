import { Router } from 'express';
import { Request, Response } from 'express';
import { embedAndStoreCompanies, embedSingleCompany, searchCompanies } from '../services/embedding.service';
import { verifyToken } from '../middlewares/verifyToken';

const router = Router();

// Route to embed all companies (admin/development use)
router.post('/embed-all-companies', verifyToken, async (req: Request, res: Response) => {
  try {
    console.log('Starting embedding process for all companies...');
    const result = await embedAndStoreCompanies();
    
    if (result.success) {
      res.status(200).json({
        success: true,
        message: result.message,
        count: result.count
      });
    } else {
      res.status(500).json({
        success: false,
        message: result.message
      });
    }
  } catch (error) {
    console.error('Error in embed-all-companies route:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while embedding companies'
    });
  }
});

// Route to embed a single company (triggered when company is created/updated)
router.post('/embed-company/:companyId', verifyToken, async (req: Request, res: Response) => {
  try {
    const { companyId } = req.params;
    
    if (!companyId) {
      return res.status(400).json({
        success: false,
        message: 'Company ID is required'
      });
    }
    
    console.log(`Embedding single company: ${companyId}`);
    const result = await embedSingleCompany(companyId);
    
    if (result.success) {
      res.status(200).json({
        success: true,
        message: result.message
      });
    } else {
      res.status(404).json({
        success: false,
        message: result.message
      });
    }
  } catch (error) {
    console.error('Error in embed-company route:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while embedding company'
    });
  }
});

// Route to search companies using embeddings
router.post('/search-companies', verifyToken, async (req: Request, res: Response) => {
  try {
    const { query, topK = 10 } = req.body;
    
    if (!query || typeof query !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Search query is required and must be a string'
      });
    }
    
    if (topK && (typeof topK !== 'number' || topK < 1 || topK > 100)) {
      return res.status(400).json({
        success: false,
        message: 'topK must be a number between 1 and 100'
      });
    }
    
    console.log(`Searching companies with query: "${query}"`);
    const result = await searchCompanies(query, topK);
    
    res.status(200).json({
      success: true,
      message: result.message,
      matches: result.matches,
      count: result.matches.length
    });
    
  } catch (error) {
    console.error('Error in search-companies route:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while searching companies'
    });
  }
});

// Route to get embedding status/stats
router.get('/status', verifyToken, async (req: Request, res: Response) => {
  try {
    // This is a simple status check - you could expand this to show index stats
    res.status(200).json({
      success: true,
      message: 'Embedding service is operational',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error in embedding status route:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking embedding service status'
    });
  }
});

export default router;