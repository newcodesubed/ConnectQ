# 🔐 Authentication Workflow Explained

## What is "Authorization: Bearer <your-token>"?

The **Bearer token** is like a **digital passport** that proves you are who you say you are when making API requests.

## 🎯 Simple Analogy

Think of it like going to a **VIP club**:

1. **Step 1**: You show your ID at the entrance (login with email/password)
2. **Step 2**: Security gives you a **wristband** (JWT token)
3. **Step 3**: You show the **wristband** to access VIP areas (API endpoints)
4. **Step 4**: Bouncer checks if wristband is valid and lets you in

## 🔄 Complete Authentication Flow

### Phase 1: Getting Your Token (Login)

```mermaid
graph TD
    A[User enters email/password] --> B[Send POST to /api/auth/login]
    B --> C[Server validates credentials]
    C --> D{Valid?}
    D -->|Yes| E[Generate JWT Token]
    D -->|No| F[Return Error]
    E --> G[Send token to user]
    F --> H[User tries again]
    G --> I[User stores token]
```

**Example Login Request:**
```http
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "mypassword123"
}
```

**Server Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxMjMiLCJlbWFpbCI6ImpvaG5AZXhhbXBsZS5jb20iLCJpYXQiOjE2MzQ1Njc4OTAsImV4cCI6MTYzNDU3ODY5MH0.abc123def456",
  "user": {
    "id": "123",
    "email": "john@example.com",
    "name": "John Doe"
  }
}
```

### Phase 2: Using Your Token (Accessing Protected Routes)

```mermaid
graph TD
    A[User wants to search companies] --> B[Include token in request header]
    B --> C[Send request to /api/embeddings/search-companies]
    C --> D[Server receives request]
    D --> E[Middleware checks Authorization header]
    E --> F{Token valid?}
    F -->|Yes| G[Process search request]
    F -->|No| H[Return 401 Unauthorized]
    G --> I[Return search results]
```

**Example Protected Request:**
```http
POST http://localhost:5000/api/embeddings/search-companies
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxMjMi...
Content-Type: application/json

{
  "query": "React developers",
  "topK": 10
}
```

## 🧩 JWT Token Breakdown

A JWT token has **3 parts** separated by dots (`.`):

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxMjMiLCJlbWFpbCI6ImpvaG5AZXhhbXBsZS5jb20iLCJpYXQiOjE2MzQ1Njc4OTAsImV4cCI6MTYzNDU3ODY5MH0.abc123def456

Header.Payload.Signature
```

### Part 1: Header
```json
{
  "alg": "HS256",
  "typ": "JWT"
}
```
*Says: "This is a JWT token using HS256 algorithm"*

### Part 2: Payload (The Important Part)
```json
{
  "userId": "123",
  "email": "john@example.com",
  "iat": 1634567890,  // Issued at timestamp
  "exp": 1634578690   // Expiration timestamp
}
```
*Says: "This token belongs to user 123, expires in X hours"*

### Part 3: Signature
```
abc123def456
```
*Says: "This proves the token wasn't tampered with"*

## 🛡️ How the Server Validates Tokens

### Step-by-Step Process:

1. **Extract Token**: Get token from `Authorization: Bearer <token>` header
2. **Verify Signature**: Make sure token wasn't modified
3. **Check Expiration**: Ensure token hasn't expired
4. **Extract User Info**: Get userId from token payload
5. **Grant Access**: Allow user to proceed if all checks pass

### Code Behind the Scenes:
```typescript
// In verifyToken.ts middleware
export const verifyToken = (req: Request, res: Response, next: NextFunction) => {
  // 1. Get token from header
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  try {
    // 2. Verify and decode token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    
    // 3. Add user info to request
    req.user = decoded;
    
    // 4. Continue to next function
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token.' });
  }
};
```

## 🌐 Frontend Integration Examples

### Using Fetch API:
```javascript
// Store token after login
localStorage.setItem('token', response.token);

// Use token in subsequent requests
const searchCompanies = async (query) => {
  const token = localStorage.getItem('token');
  
  const response = await fetch('/api/embeddings/search-companies', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      query: query,
      topK: 10
    })
  });
  
  return response.json();
};
```

### Using Axios:
```javascript
// Set default authorization header
axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

// Now all requests include the token automatically
const searchCompanies = (query) => {
  return axios.post('/api/embeddings/search-companies', {
    query: query,
    topK: 10
  });
};
```

## ⚠️ Common Authentication Errors

### 1. Missing Token (401 Unauthorized)
```json
{
  "success": false,
  "message": "Access denied. No token provided."
}
```
**Solution**: Include `Authorization: Bearer <token>` header

### 2. Invalid Token (401 Unauthorized)
```json
{
  "success": false,
  "message": "Invalid token."
}
```
**Solutions**: 
- Token might be expired → Login again
- Token might be corrupted → Clear and login again
- Wrong JWT_SECRET on server → Check environment variables

### 3. Expired Token (401 Unauthorized)
```json
{
  "success": false,
  "message": "Token expired."
}
```
**Solution**: Login again to get a new token

## 🔄 Token Lifecycle Management

### Frontend Token Handling:
```javascript
class AuthService {
  // Save token after login
  saveToken(token) {
    localStorage.setItem('authToken', token);
  }
  
  // Get token for requests
  getToken() {
    return localStorage.getItem('authToken');
  }
  
  // Remove token on logout
  logout() {
    localStorage.removeItem('authToken');
    // Redirect to login page
  }
  
  // Check if token exists and is valid
  isAuthenticated() {
    const token = this.getToken();
    if (!token) return false;
    
    // Check if token is expired
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp > Date.now() / 1000;
    } catch {
      return false;
    }
  }
}
```

## 🎯 Testing Authentication

### Using curl:
```bash
# 1. Login to get token
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Response contains token:
# {"success":true,"token":"eyJhbGc...","user":{...}}

# 2. Use token to access protected endpoint
curl -X POST http://localhost:5000/api/embeddings/search-companies \
  -H "Authorization: Bearer eyJhbGc..." \
  -H "Content-Type: application/json" \
  -d '{"query":"React developers","topK":5}'
```

### Using Postman:
1. **Create login request**:
   - Method: POST
   - URL: `http://localhost:5000/api/auth/login`
   - Body: `{"email":"test@example.com","password":"password123"}`

2. **Copy token from response**

3. **Create search request**:
   - Method: POST
   - URL: `http://localhost:5000/api/embeddings/search-companies`
   - Headers: `Authorization: Bearer <paste-token-here>`
   - Body: `{"query":"React developers","topK":10}`

## 🚀 Quick Authentication Setup

### 1. Environment Setup:
```env
JWT_SECRET=your-super-secret-key-here-make-it-long-and-random
JWT_EXPIRES_IN=24h
```

### 2. Test User Creation:
```bash
# Create a test user through signup endpoint
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123"
  }'
```

### 3. Login and Get Token:
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### 4. Test Protected Endpoint:
```bash
curl -X GET http://localhost:5000/api/embeddings/status \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**The token is your digital key to access all the powerful embedding features! 🔑✨**