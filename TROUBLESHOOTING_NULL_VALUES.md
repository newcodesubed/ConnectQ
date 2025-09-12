# 🐛 Troubleshooting Guide - Null Value Errors in Pinecone

## ❌ Common Error: "got 'null' for field"

### Error Message:
```
got 'null' for field 'deliveryDuration'
at mapHttpStatusError (/path/to/pinecone/errors/http.ts:188:14)
...
Error embedding single company: Error: Failed to upsert vectors to Pinecone
```

### 🔍 Root Cause:
**Pinecone vector database does not accept `null` values in metadata.** When company data has null fields (like `deliveryDuration: null`), Pinecone rejects the entire upsert operation.

### ✅ Solution Implemented:

#### 1. **Null Value Sanitization**
Added helper functions to convert null values to safe alternatives:

```typescript
// Helper function to safely convert values (Pinecone doesn't accept null)
const safeValue = (value: any): string => {
  if (value === null || value === undefined) return '';
  if (Array.isArray(value)) return value.filter(v => v !== null && v !== undefined).join(', ');
  return String(value);
};

const safeNumber = (value: any): number => {
  if (value === null || value === undefined) return 0;
  return Number(value) || 0;
};
```

#### 2. **Enhanced Data Processing**
Updated the embedding service to process all company data safely:

```typescript
metadata: {
  id: company.id,
  name: safeValue(company.name),
  email: safeValue(company.email),
  industry: safeValue(company.industry),
  location: safeValue(company.location),
  description: safeValue(company.description),
  website: safeValue(company.website),
  tagline: safeValue(company.tagline),
  foundedAt: company.foundedAt?.toISOString() || '',
  employeeCount: safeNumber(company.employeeCount),
  services: safeValue(company.services),
  technologiesUsed: safeValue(company.technologiesUsed),
  specializations: safeValue(company.specializations),
  costRange: safeValue(company.costRange),
  deliveryDuration: safeValue(company.deliveryDuration), // ← This was causing the error
  contactNumber: safeValue(company.contactNumber),
  logoUrl: safeValue(company.logoUrl),
  linkedinUrl: safeValue(company.linkedinUrl),
  twitterUrl: safeValue(company.twitterUrl),
  reviews: safeValue(company.reviews),
  chunk_text: texts[i],
  embedded_at: new Date().toISOString(),
}
```

#### 3. **Improved Error Handling**
Added validation and debugging information:

```typescript
// Check for null values in metadata before upserting
if (vector.metadata) {
  for (const [key, value] of Object.entries(vector.metadata)) {
    if (value === null || value === undefined) {
      console.warn(`Null value detected for metadata key '${key}' in vector ${vector.id}, converting to empty string`);
      vector.metadata[key] = '';
    }
  }
}
```

#### 4. **Enhanced Text Canonicalization**
Updated the `toDoc()` function to handle all edge cases:

```typescript
const formatText = (text: string | null | undefined) => {
  if (!text || text.trim() === '') return 'Not specified';
  return text.trim();
};

const formatNumber = (num: number | null | undefined) => {
  if (num === null || num === undefined || isNaN(num)) return 'Not specified';
  return num.toString();
};

const formatArray = (arr: string[] | null | undefined) => {
  if (!arr || !Array.isArray(arr)) return 'Not specified';
  const filtered = arr.filter(item => item && item.trim() !== '');
  return filtered.length > 0 ? filtered.join(', ') : 'Not specified';
};
```

## 🎯 Prevention Strategies

### 1. **Database Level**
Consider adding default values in your database schema:
```sql
ALTER TABLE companies 
ALTER COLUMN delivery_duration SET DEFAULT '';

ALTER TABLE companies 
ALTER COLUMN cost_range SET DEFAULT '';
```

### 2. **Application Level**
Validate data before sending to embedding service:
```typescript
const sanitizeCompanyData = (company: Company) => ({
  ...company,
  deliveryDuration: company.deliveryDuration || '',
  costRange: company.costRange || '',
  description: company.description || '',
  // ... other fields
});
```

### 3. **API Level**
Add validation middleware to ensure required fields:
```typescript
const validateCompanyData = (req: Request, res: Response, next: NextFunction) => {
  // Sanitize null values before processing
  if (req.body.deliveryDuration === null) req.body.deliveryDuration = '';
  if (req.body.costRange === null) req.body.costRange = '';
  next();
};
```

## 🔍 Debugging Tips

### 1. **Check Raw Data**
```typescript
console.log('Company data before embedding:', JSON.stringify(company, null, 2));
```

### 2. **Validate Metadata**
```typescript
const hasNullValues = Object.values(metadata).some(val => val === null || val === undefined);
if (hasNullValues) {
  console.warn('Null values detected in metadata:', metadata);
}
```

### 3. **Test Individual Fields**
```typescript
const problematicFields = Object.entries(company)
  .filter(([key, value]) => value === null)
  .map(([key]) => key);
  
if (problematicFields.length > 0) {
  console.warn(`Null fields in company ${company.id}:`, problematicFields);
}
```

## ✅ Verification

After implementing the fix, you should see:

```bash
🚀 Starting company embedding initialization...
✅ Pinecone index "connectq" is ready
📊 Starting to embed all companies...
Found 4 companies in database
Generating embeddings for 4 companies...
Successfully generated 4 embeddings
Upserting 4 vectors to Pinecone...
Upserted batch 1/1
Successfully upserted 4 company vectors into Pinecone index: connectq
✅ Successfully embedded 4 companies!
```

## 🚨 Future Considerations

1. **Data Validation**: Implement stricter validation at form input level
2. **Default Values**: Set sensible defaults for optional fields
3. **Type Safety**: Use TypeScript strict null checks
4. **Testing**: Add unit tests for null value handling

The embedding system now robustly handles any null or undefined values in your company data! 🎉