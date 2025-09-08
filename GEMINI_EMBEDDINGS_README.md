# 🤖 Gemini Embeddings Integration Guide

This guide walks you through integrating Google's Gemini embedding model (`gemini-embedding-001`) with your ConnectQ company data to enable AI-powered search, recommendations, and semantic matching.

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Setup](#environment-setup)
- [Backend Integration](#backend-integration)
- [Database Schema Updates](#database-schema-updates)
- [API Implementation](#api-implementation)
- [Frontend Integration](#frontend-integration)
- [Usage Examples](#usage-examples)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

## 🚀 Prerequisites

- Node.js (v18+)
- Google Cloud Project with Gemini API access
- Existing ConnectQ application setup
- PostgreSQL database

## 📦 Installation

### 1. Install Required Packages

```bash
# Backend dependencies
cd backend
npm install @google-cloud/aiplatform google-auth-library dotenv

# Alternative: Using Google Generative AI SDK
npm install @google/generative-ai

# Frontend dependencies (optional for client-side features)
cd ../frontend
npm install @google/generative-ai
```

### 2. Get Gemini API Key

1. Go to [Google AI Studio](https://aistudio.google.com/)
2. Create a new project or select existing one
3. Generate an API key
4. Save the API key securely

## 🔧 Environment Setup

### Backend Environment Variables

Add to your `backend/.env` file:

```env
# Existing environment variables...
DATABASE_URL=your_database_url
JWT_SECRET=your_jwt_secret

# Gemini AI Configuration
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-embedding-001

# Optional: Google Cloud Configuration (if using Cloud AI Platform)
GOOGLE_CLOUD_PROJECT_ID=your_project_id
GOOGLE_APPLICATION_CREDENTIALS=path/to/service-account.json
```

## 🗄️ Database Schema Updates

### 1. Create Migration for Embeddings

Create a new migration file:

```bash
cd backend
npx drizzle-kit generate:pg --name add_company_embeddings
```

### 2. Update Company Model

Add embedding fields to your `companies.model.ts`:

```typescript
import { pgTable, text, timestamp, uuid, integer, vector } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './user.model';

export const companies = pgTable('companies', {
  // ... existing fields ...
  
  // AI Embeddings
  descriptionEmbedding: vector('description_embedding', { dimensions: 768 }),
  servicesEmbedding: vector('services_embedding', { dimensions: 768 }),
  combinedEmbedding: vector('combined_embedding', { dimensions: 768 }),
  embeddingUpdatedAt: timestamp('embedding_updated_at', { mode: 'date' }),
  
  // ... rest of existing fields ...
});
```

### 3. Run Migration

```bash
npx drizzle-kit push:pg
```

## 🔧 Backend Integration

### 1. Create Gemini Service

Create `backend/src/services/gemini.service.ts`:

```typescript
import { GoogleGenerativeAI } from '@google/generative-ai';
import logger from '../utils/logger';

class GeminiService {
  private client: GoogleGenerativeAI;
  private model: string;

  constructor() {
    this.client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    this.model = process.env.GEMINI_MODEL || 'gemini-embedding-001';
  }

  /**
   * Generate embeddings for given text
   */
  async generateEmbedding(text: string): Promise<number[] | null> {
    try {
      if (!text || text.trim().length === 0) {
        return null;
      }

      const model = this.client.getGenerativeModel({ model: 'embedding-001' });
      const result = await model.embedContent(text);
      
      return result.embedding.values;
    } catch (error) {
      logger.error('Error generating embedding:', error);
      return null;
    }
  }

  /**
   * Generate embeddings for company data
   */
  async generateCompanyEmbeddings(company: {
    name: string;
    description?: string;
    industry?: string;
    services?: string[];
    technologiesUsed?: string[];
    specializations?: string[];
    tagline?: string;
  }) {
    try {
      // Combine company information for comprehensive embedding
      const combinedText = this.createCombinedCompanyText(company);
      
      // Generate specific embeddings
      const descriptionEmbedding = company.description 
        ? await this.generateEmbedding(company.description)
        : null;
      
      const servicesText = [
        ...(company.services || []),
        ...(company.technologiesUsed || []),
        ...(company.specializations || [])
      ].join(', ');
      
      const servicesEmbedding = servicesText 
        ? await this.generateEmbedding(servicesText)
        : null;
      
      const combinedEmbedding = await this.generateEmbedding(combinedText);

      return {
        descriptionEmbedding,
        servicesEmbedding,
        combinedEmbedding,
        embeddingUpdatedAt: new Date()
      };
    } catch (error) {
      logger.error('Error generating company embeddings:', error);
      return {
        descriptionEmbedding: null,
        servicesEmbedding: null,
        combinedEmbedding: null,
        embeddingUpdatedAt: new Date()
      };
    }
  }

  /**
   * Create combined text representation of company
   */
  private createCombinedCompanyText(company: {
    name: string;
    description?: string;
    industry?: string;
    services?: string[];
    technologiesUsed?: string[];
    specializations?: string[];
    tagline?: string;
  }): string {
    const parts = [
      `Company: ${company.name}`,
      company.tagline ? `Tagline: ${company.tagline}` : '',
      company.industry ? `Industry: ${company.industry}` : '',
      company.description ? `Description: ${company.description}` : '',
      company.services?.length ? `Services: ${company.services.join(', ')}` : '',
      company.technologiesUsed?.length ? `Technologies: ${company.technologiesUsed.join(', ')}` : '',
      company.specializations?.length ? `Specializations: ${company.specializations.join(', ')}` : ''
    ].filter(Boolean);

    return parts.join('. ');
  }

  /**
   * Calculate similarity between two embeddings using cosine similarity
   */
  calculateSimilarity(embedding1: number[], embedding2: number[]): number {
    if (embedding1.length !== embedding2.length) {
      return 0;
    }

    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;

    for (let i = 0; i < embedding1.length; i++) {
      dotProduct += embedding1[i] * embedding2[i];
      norm1 += embedding1[i] * embedding1[i];
      norm2 += embedding2[i] * embedding2[i];
    }

    if (norm1 === 0 || norm2 === 0) {
      return 0;
    }

    return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
  }

  /**
   * Find similar companies based on query embedding
   */
  async findSimilarCompanies(
    queryEmbedding: number[],
    companies: Array<{
      id: string;
      name: string;
      combinedEmbedding: number[] | null;
    }>,
    limit: number = 10
  ) {
    const similarities = companies
      .filter(company => company.combinedEmbedding)
      .map(company => ({
        ...company,
        similarity: this.calculateSimilarity(queryEmbedding, company.combinedEmbedding!)
      }))
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit);

    return similarities;
  }
}

export const geminiService = new GeminiService();
export default geminiService;
```

### 2. Update Company Repository

Add embedding methods to `backend/src/repository/companies.repository.ts`:

```typescript
import { db } from '../db';
import { companies } from '../model/companies.model';
import { eq, sql } from 'drizzle-orm';
import geminiService from '../services/gemini.service';

export const CompanyRepository = {
  // ... existing methods ...

  /**
   * Update company embeddings
   */
  async updateEmbeddings(id: string, embeddings: {
    descriptionEmbedding: number[] | null;
    servicesEmbedding: number[] | null;
    combinedEmbedding: number[] | null;
    embeddingUpdatedAt: Date;
  }) {
    const result = await db
      .update(companies)
      .set({
        descriptionEmbedding: embeddings.descriptionEmbedding,
        servicesEmbedding: embeddings.servicesEmbedding,
        combinedEmbedding: embeddings.combinedEmbedding,
        embeddingUpdatedAt: embeddings.embeddingUpdatedAt
      })
      .where(eq(companies.id, id))
      .returning();
    
    return result[0] || null;
  },

  /**
   * Find companies by semantic similarity
   */
  async findSimilarCompanies(queryEmbedding: number[], limit: number = 10) {
    // Using vector similarity search (requires pgvector extension)
    const result = await db
      .select({
        id: companies.id,
        name: companies.name,
        description: companies.description,
        industry: companies.industry,
        services: companies.services,
        combinedEmbedding: companies.combinedEmbedding,
        similarity: sql`1 - (${companies.combinedEmbedding} <=> ${queryEmbedding}::vector)`
      })
      .from(companies)
      .where(sql`${companies.combinedEmbedding} IS NOT NULL`)
      .orderBy(sql`${companies.combinedEmbedding} <=> ${queryEmbedding}::vector`)
      .limit(limit);

    return result;
  },

  /**
   * Get all companies with embeddings for manual similarity calculation
   */
  async getAllWithEmbeddings() {
    const result = await db
      .select({
        id: companies.id,
        name: companies.name,
        description: companies.description,
        combinedEmbedding: companies.combinedEmbedding
      })
      .from(companies)
      .where(sql`${companies.combinedEmbedding} IS NOT NULL`);

    return result;
  }
};
```

### 3. Update Company Controller

Modify `backend/src/controllers/companies.controller.ts`:

```typescript
import geminiService from '../services/gemini.service';

export const createCompany = async (req: Request, res: Response) => {
  try {
    // ... existing company creation logic ...

    const newCompany = await CompanyRepository.create(companyData);

    // Generate embeddings asynchronously
    setImmediate(async () => {
      try {
        const embeddings = await geminiService.generateCompanyEmbeddings({
          name: newCompany.name,
          description: newCompany.description,
          industry: newCompany.industry,
          services: newCompany.services,
          technologiesUsed: newCompany.technologiesUsed,
          specializations: newCompany.specializations,
          tagline: newCompany.tagline
        });

        await CompanyRepository.updateEmbeddings(newCompany.id, embeddings);
        logger.info(`Embeddings generated for company: ${newCompany.name}`);
      } catch (error) {
        logger.error(`Failed to generate embeddings for company ${newCompany.id}:`, error);
      }
    });

    logger.info(`Company created successfully: ${newCompany.name} by user ${userId}`);

    res.status(201).json({
      success: true,
      message: "Company created successfully",
      company: newCompany
    });
  } catch (error: any) {
    // ... existing error handling ...
  }
};

// Add semantic search endpoint
export const searchCompanies = async (req: Request, res: Response) => {
  try {
    const { query, limit = 10 } = req.body;

    if (!query || query.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Search query is required"
      });
    }

    // Generate embedding for search query
    const queryEmbedding = await geminiService.generateEmbedding(query);
    
    if (!queryEmbedding) {
      return res.status(500).json({
        success: false,
        message: "Failed to process search query"
      });
    }

    // Find similar companies
    const similarCompanies = await CompanyRepository.findSimilarCompanies(
      queryEmbedding, 
      parseInt(limit)
    );

    res.status(200).json({
      success: true,
      query,
      results: similarCompanies,
      count: similarCompanies.length
    });
  } catch (error: any) {
    logger.error("Error in semantic search:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// Add recommendation endpoint
export const getRecommendations = async (req: Request, res: Response) => {
  try {
    const { companyId } = req.params;
    const { limit = 5 } = req.query;

    const targetCompany = await CompanyRepository.findById(companyId);
    
    if (!targetCompany || !targetCompany.combinedEmbedding) {
      return res.status(404).json({
        success: false,
        message: "Company not found or embeddings not available"
      });
    }

    const recommendations = await CompanyRepository.findSimilarCompanies(
      targetCompany.combinedEmbedding,
      parseInt(limit as string) + 1 // +1 to exclude the target company
    );

    // Remove the target company from results
    const filteredRecommendations = recommendations.filter(
      company => company.id !== companyId
    );

    res.status(200).json({
      success: true,
      targetCompany: {
        id: targetCompany.id,
        name: targetCompany.name
      },
      recommendations: filteredRecommendations,
      count: filteredRecommendations.length
    });
  } catch (error: any) {
    logger.error("Error getting recommendations:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};
```

### 4. Add New Routes

Update `backend/src/routes/companies.routes.ts`:

```typescript
// Add these new routes
router.post("/search", verifyToken, searchCompanies);
router.get("/:id/recommendations", verifyToken, getRecommendations);

// Optional: Admin route to regenerate all embeddings
router.post("/admin/regenerate-embeddings", verifyToken, requireAdminRole, regenerateAllEmbeddings);
```

## 🎨 Frontend Integration

### 1. Create Search Service

Create `frontend/src/services/search.service.ts`:

```typescript
import axios from 'axios';

const API_URL = "http://localhost:5000/api/companies";

export interface SearchResult {
  id: string;
  name: string;
  description?: string;
  industry?: string;
  services?: string[];
  similarity: number;
}

export const searchService = {
  async semanticSearch(query: string, limit: number = 10): Promise<SearchResult[]> {
    try {
      const response = await axios.post(`${API_URL}/search`, {
        query,
        limit
      });
      
      return response.data.results || [];
    } catch (error) {
      console.error('Semantic search error:', error);
      return [];
    }
  },

  async getRecommendations(companyId: string, limit: number = 5): Promise<SearchResult[]> {
    try {
      const response = await axios.get(`${API_URL}/${companyId}/recommendations`, {
        params: { limit }
      });
      
      return response.data.recommendations || [];
    } catch (error) {
      console.error('Recommendations error:', error);
      return [];
    }
  }
};
```

### 2. Create Search Component

Create `frontend/src/components/SemanticSearch.tsx`:

```tsx
import React, { useState } from 'react';
import { Search, Loader } from 'lucide-react';
import { searchService, SearchResult } from '../services/search.service';

const SemanticSearch: React.FC = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    try {
      const searchResults = await searchService.semanticSearch(query);
      setResults(searchResults);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <form onSubmit={handleSearch} className="mb-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search companies by description, services, or technologies..."
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            type="submit"
            disabled={loading}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-500 text-white px-4 py-1.5 rounded-md hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? <Loader className="w-4 h-4 animate-spin" /> : 'Search'}
          </button>
        </div>
      </form>

      {results.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Search Results ({results.length})</h3>
          {results.map((company) => (
            <div key={company.id} className="bg-white p-6 rounded-lg shadow-md border">
              <div className="flex justify-between items-start mb-2">
                <h4 className="text-xl font-semibold text-gray-900">{company.name}</h4>
                <span className="text-sm text-gray-500">
                  {Math.round(company.similarity * 100)}% match
                </span>
              </div>
              {company.industry && (
                <p className="text-blue-600 text-sm mb-2">{company.industry}</p>
              )}
              {company.description && (
                <p className="text-gray-700 mb-3">{company.description}</p>
              )}
              {company.services && company.services.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {company.services.slice(0, 5).map((service, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full"
                    >
                      {service}
                    </span>
                  ))}
                  {company.services.length > 5 && (
                    <span className="text-gray-500 text-xs">
                      +{company.services.length - 5} more
                    </span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SemanticSearch;
```

## 📊 Usage Examples

### 1. Basic Company Search

```typescript
// Search for web development companies
const results = await searchService.semanticSearch(
  "React Next.js web development e-commerce"
);

// Search for AI/ML companies
const aiCompanies = await searchService.semanticSearch(
  "artificial intelligence machine learning data science"
);
```

### 2. Company Recommendations

```typescript
// Get similar companies to a specific company
const recommendations = await searchService.getRecommendations(
  "company-uuid-here",
  5
);
```

### 3. Batch Embedding Generation

Create a script `backend/scripts/generate-embeddings.ts`:

```typescript
import { CompanyRepository } from '../src/repository/companies.repository';
import geminiService from '../src/services/gemini.service';
import logger from '../src/utils/logger';

async function generateAllEmbeddings() {
  try {
    const companies = await CompanyRepository.findAll();
    
    for (const company of companies) {
      try {
        logger.info(`Generating embeddings for: ${company.name}`);
        
        const embeddings = await geminiService.generateCompanyEmbeddings({
          name: company.name,
          description: company.description,
          industry: company.industry,
          services: company.services,
          technologiesUsed: company.technologiesUsed,
          specializations: company.specializations,
          tagline: company.tagline
        });

        await CompanyRepository.updateEmbeddings(company.id, embeddings);
        
        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        logger.error(`Failed to process company ${company.id}:`, error);
      }
    }
    
    logger.info('Embedding generation completed');
  } catch (error) {
    logger.error('Batch embedding generation failed:', error);
  }
}

generateAllEmbeddings();
```

## ✅ Best Practices

### 1. Rate Limiting
```typescript
// Implement rate limiting for API calls
const rateLimiter = {
  lastCall: 0,
  minInterval: 1000, // 1 second between calls
  
  async wait() {
    const now = Date.now();
    const timeSinceLastCall = now - this.lastCall;
    
    if (timeSinceLastCall < this.minInterval) {
      await new Promise(resolve => 
        setTimeout(resolve, this.minInterval - timeSinceLastCall)
      );
    }
    
    this.lastCall = Date.now();
  }
};
```

### 2. Caching Embeddings
```typescript
// Cache embeddings to avoid regeneration
const embeddingCache = new Map<string, number[]>();

async function getCachedEmbedding(text: string): Promise<number[]> {
  const cacheKey = Buffer.from(text).toString('base64');
  
  if (embeddingCache.has(cacheKey)) {
    return embeddingCache.get(cacheKey)!;
  }
  
  const embedding = await geminiService.generateEmbedding(text);
  if (embedding) {
    embeddingCache.set(cacheKey, embedding);
  }
  
  return embedding || [];
}
```

### 3. Error Handling
```typescript
// Implement robust error handling
async function safeGenerateEmbedding(text: string, retries: number = 3): Promise<number[] | null> {
  for (let i = 0; i < retries; i++) {
    try {
      return await geminiService.generateEmbedding(text);
    } catch (error) {
      logger.warn(`Embedding generation attempt ${i + 1} failed:`, error);
      
      if (i < retries - 1) {
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
      }
    }
  }
  
  return null;
}
```

## 🔧 Troubleshooting

### Common Issues

1. **API Key Issues**
   ```bash
   Error: GEMINI_API_KEY not found
   ```
   Solution: Ensure your API key is properly set in the `.env` file.

2. **Vector Extension Missing**
   ```bash
   Error: column "embedding" does not exist
   ```
   Solution: Install pgvector extension:
   ```sql
   CREATE EXTENSION IF NOT EXISTS vector;
   ```

3. **Embedding Dimension Mismatch**
   ```bash
   Error: dimension mismatch
   ```
   Solution: Ensure all embeddings use the same dimension (768 for Gemini).

4. **Rate Limiting**
   ```bash
   Error: Too Many Requests
   ```
   Solution: Implement proper rate limiting and retry logic.

### Performance Optimization

1. **Batch Processing**: Process multiple companies in batches
2. **Async Processing**: Generate embeddings asynchronously
3. **Index Optimization**: Create proper database indexes for vector searches
4. **Caching**: Implement embedding caching for frequently accessed data

## 🚀 Deployment Considerations

1. **Environment Variables**: Ensure all API keys are properly configured
2. **Database**: Install pgvector extension in production
3. **Monitoring**: Monitor API usage and costs
4. **Backup**: Regular backup of embedding data
5. **Scaling**: Consider using a vector database for large-scale deployments

---

## 📞 Support

For additional help:
- Check Google AI documentation: https://ai.google.dev/docs
- Review pgvector documentation: https://github.com/pgvector/pgvector
- ConnectQ GitHub issues: [Your repository issues]

Happy coding! 🎉
