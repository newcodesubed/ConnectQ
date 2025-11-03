# ConnectQ Authentication System Documentation

## 🔐 Complete Authentication Flow & State Management

This document provides a comprehensive overview of the authentication system in ConnectQ, covering the complete user journey from signup to login, including email verification, password reset, and state management.

---

## 📋 Table of Contents

1. [System Architecture](#system-architecture)
2. [User Flow Overview](#user-flow-overview)
3. [Backend Implementation](#backend-implementation)
4. [Frontend State Management](#frontend-state-management)
5. [API Endpoints](#api-endpoints)
6. [Database Schema](#database-schema)
7. [Email System](#email-system)
8. [Security Features](#security-features)
9. [Error Handling](#error-handling)
10. [Environment Setup](#environment-setup)

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    ConnectQ Auth System                          │
├─────────────────────┬─────────────────────┬─────────────────────┤
│     Frontend        │      Backend        │     External        │
│  (React + Zustand)  │   (Node.js + JWT)   │   (Email Service)   │
├─────────────────────┼─────────────────────┼─────────────────────┤
│ • Auth Store        │ • Auth Controller   │ • Nodemailer       │
│ • Role Management   │ • JWT Middleware    │ • Gmail SMTP        │
│ • State Persistence │ • User Repository   │ • Email Templates   │
│ • Local Storage     │ • Password Hashing  │ • Verification      │
└─────────────────────┴─────────────────────┴─────────────────────┘
```

---

## 🚀 User Flow Overview

### 1. Complete User Journey

```mermaid
graph TD
    A[User Visits App] --> B[Select Role: Client/Company]
    B --> C[Fill Signup Form]
    C --> D[Submit Registration]
    D --> E[Account Created - Verification Email Sent]
    E --> F[Check Email for 6-digit Code]
    F --> G[Enter Verification Code]
    G --> H{Code Valid?}
    H -->|Yes| I[Account Verified - Welcome Email]
    H -->|No| J[Show Error - Try Again]
    I --> K[Redirect to Login]
    K --> L[User Can Login]
    
    M[Forgot Password?] --> N[Enter Email]
    N --> O[Reset Email Sent]
    O --> P[Click Reset Link]
    P --> Q[Enter New Password]
    Q --> R[Password Updated]
    R --> S[Success Email Sent]
```

---

## 🖥️ Backend Implementation

### Core Technologies
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: JWT (JSON Web Tokens)
- **Password Security**: bcryptjs for hashing
- **Email Service**: Nodemailer with Gmail SMTP

### Authentication Controller (`auth.controller.ts`)

#### 1. **Signup Process**
```typescript
export const signup = async (req: Request, res: Response) => {
  // 1. Validate required fields (email, password, name, role)
  // 2. Check if user already exists
  // 3. Hash password with bcrypt
  // 4. Generate 6-digit verification token
  // 5. Create user in database (unverified)
  // 6. Generate JWT and set cookie
  // 7. Send verification email
  // 8. Return success response
}
```

**Flow:**
1. Validates all required fields
2. Checks for existing user with same email
3. Hashes password using bcrypt (salt rounds: 10)
4. Generates random 6-digit verification code
5. Sets verification expiry (24 hours)
6. Creates user record in database
7. Generates JWT token and sets HTTP-only cookie
8. Sends verification email with 6-digit code

#### 2. **Email Verification Process**
```typescript
export const verifyEmail = async (req: Request, res: Response) => {
  // 1. Extract verification code from request
  // 2. Find user with matching code and valid expiry
  // 3. Update user as verified
  // 4. Clear verification token
  // 5. Send welcome email
  // 6. Return updated user data
}
```

**Flow:**
1. Receives 6-digit verification code
2. Searches for user with matching token and valid expiry
3. Updates user's `isVerified` status to `true`
4. Clears verification token and expiry
5. Sends welcome email with login link
6. Returns verified user data

#### 3. **Login Process**
```typescript
export const login = async (req: Request, res: Response) => {
  // 1. Extract email and password
  // 2. Find user by email
  // 3. Verify password with bcrypt
  // 4. Generate JWT and set cookie
  // 5. Update last login timestamp
  // 6. Return user data
}
```

**Flow:**
1. Validates email and password
2. Finds user in database by email
3. Compares provided password with hashed password
4. Generates new JWT token and sets cookie
5. Updates user's last login timestamp
6. Returns user data (excluding password)

#### 4. **Forgot Password Process**
```typescript
export const forgetPassword = async (req: Request, res: Response) => {
  // 1. Extract email from request
  // 2. Find user by email
  // 3. Generate crypto reset token
  // 4. Set token expiry (1 hour)
  // 5. Send password reset email
  // 6. Return success message
}
```

**Flow:**
1. Validates email exists in system
2. Generates cryptographically secure reset token
3. Sets token expiry to 1 hour
4. Stores token in database
5. Sends email with reset link containing token
6. Returns success message

#### 5. **Reset Password Process**
```typescript
export const resetPassword = async (req: Request, res: Response) => {
  // 1. Extract token from URL params
  // 2. Extract new password from body
  // 3. Find user by valid reset token
  // 4. Hash new password
  // 5. Update password and clear reset token
  // 6. Send success email
  // 7. Return success message
}
```

**Flow:**
1. Extracts reset token from URL parameters
2. Validates token exists and hasn't expired
3. Hashes new password with bcrypt
4. Updates user's password in database
5. Clears reset token and expiry
6. Sends password reset success email
7. Returns success confirmation

#### 6. **Authentication Check**
```typescript
export const checkAuth = async (req: Request, res: Response) => {
  // 1. Extract user ID from JWT (set by middleware)
  // 2. Find user in database
  // 3. Return user data (excluding password)
}
```

### JWT Middleware (`verifyToken.ts`)

```typescript
export const verifyToken = (req: Request, res: Response, next: NextFunction) => {
  // 1. Extract token from HTTP-only cookie
  // 2. Verify token with JWT secret
  // 3. Extract user ID from token payload
  // 4. Attach user ID to request object
  // 5. Continue to next middleware/route
}
```

**Security Features:**
- HTTP-only cookies prevent XSS attacks
- JWT tokens expire after 7 days
- Secure cookie settings for production
- Token verification on protected routes

---

## 🎯 Frontend State Management

### Auth Store (`auth.store.ts`)

Built with **Zustand** for lightweight, efficient state management.

#### State Structure
```typescript
interface AuthState {
  user: User | null;           // Current authenticated user
  roleChoice: Role | null;     // Selected role (client/company)
  isAuthenticated: boolean;    // Authentication status
  loading: boolean;            // Loading state for UI
  error: string | null;        // Error messages
  message: string | null;      // Success messages
}
```

#### Key Features

1. **Role Persistence with localStorage**
   ```typescript
   setRoleChoice: (role) => {
     localStorage.setItem('roleChoice', role);
     set({ roleChoice: role });
   },
   
   loadRoleFromStorage: () => {
     const storedRole = localStorage.getItem('roleChoice');
     if (storedRole === 'client' || storedRole === 'company') {
       set({ roleChoice: storedRole });
     }
   }
   ```

2. **Authentication State Management**
   ```typescript
   checkAuth: async () => {
     // Verifies current authentication status
     // Updates user state based on server response
     // Handles automatic login on app reload
   }
   ```

3. **Automatic State Updates**
   - Updates `isAuthenticated` based on successful operations
   - Manages loading states during API calls
   - Handles error states with user-friendly messages
   - Persists role choice across browser sessions

### State Flow Diagram

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Role Select   │───▶│     Signup      │───▶│ Email Verify    │
│                 │    │                 │    │                 │
│ roleChoice: null│    │ user: null      │    │ user: created   │
│ stored in       │    │ loading: true   │    │ isVerified: false│
│ localStorage    │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                        │
┌─────────────────┐    ┌─────────────────┐              │
│ Authenticated   │◀───│     Login       │◀─────────────┘
│                 │    │                 │
│ user: verified  │    │ user: verified  │
│ isAuthenticated:│    │ isAuthenticated:│
│ true            │    │ true            │
└─────────────────┘    └─────────────────┘
```

---

## 🔌 API Endpoints

### Base URL: `http://localhost:5000/api/auth`

| Method | Endpoint | Description | Body | Response |
|--------|----------|-------------|------|----------|
| POST | `/signup` | Create new user account | `{email, password, name, role}` | User object + JWT cookie |
| POST | `/verify-email` | Verify email with 6-digit code | `{code}` | Verified user object |
| POST | `/login` | Authenticate user | `{email, password}` | User object + JWT cookie |
| POST | `/logout` | Clear authentication | None | Success message |
| POST | `/forget-password` | Request password reset | `{email}` | Success message |
| POST | `/reset-password/:token` | Reset password with token | `{password}` | Success message |
| GET | `/check-auth` | Verify current auth status | None | Current user object |

### Request/Response Examples

#### Signup Request
```json
POST /api/auth/signup
{
  "email": "user@example.com",
  "password": "securePassword123",
  "name": "John Doe",
  "role": "client"
}
```

#### Signup Response
```json
{
  "success": true,
  "message": "User created successfully",
  "user": {
    "id": "uuid-here",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "client",
    "isVerified": false,
    "createdAt": "2025-10-16T10:00:00.000Z"
  }
}
```

#### Verification Request
```json
POST /api/auth/verify-email
{
  "code": "123456"
}
```

---

## 🗄️ Database Schema

### Users Table Structure

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT CHECK (role IN ('client', 'company')) NOT NULL,
  is_verified BOOLEAN DEFAULT FALSE,
  last_login TIMESTAMP,
  reset_password_token TEXT,
  reset_password_expires_at TIMESTAMP,
  verification_token TEXT,
  verification_expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Field Descriptions

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Primary key, auto-generated |
| `email` | TEXT | Unique user email address |
| `password` | TEXT | bcrypt hashed password |
| `name` | TEXT | User's full name |
| `role` | ENUM | Either 'client' or 'company' |
| `is_verified` | BOOLEAN | Email verification status |
| `last_login` | TIMESTAMP | Last successful login |
| `reset_password_token` | TEXT | Crypto token for password reset |
| `reset_password_expires_at` | TIMESTAMP | Reset token expiry |
| `verification_token` | TEXT | 6-digit email verification code |
| `verification_expires_at` | TIMESTAMP | Verification code expiry (24h) |

---

## 📧 Email System

### Email Service Configuration

```typescript
// Gmail SMTP Configuration
const transporter = nodemailer.createTransporter({
  service: "gmail",
  auth: {
    user: process.env.USER_EMAIL,
    pass: process.env.USER_PASSWORD  // App password
  }
});
```

### Email Types

1. **Verification Email**
   - Sent immediately after signup
   - Contains 6-digit numeric code
   - Valid for 24 hours
   - Professional HTML template

2. **Welcome Email**
   - Sent after successful verification
   - Contains login link
   - Personalized with user's name

3. **Password Reset Email**
   - Sent when user requests password reset
   - Contains secure reset link with token
   - Valid for 1 hour

4. **Reset Success Email**
   - Sent after successful password reset
   - Confirms password was changed
   - Security notification

### Email Templates Features
- Responsive HTML design
- Brand-consistent styling
- Clear call-to-action buttons
- Professional appearance
- Mobile-friendly layout

---

## 🔒 Security Features

### Password Security
```typescript
// Password Hashing
const hashedPassword = await bcrypt.hash(password, 10);

// Password Verification
const isValid = await bcrypt.compare(password, hashedPassword);
```

### JWT Security
```typescript
// Token Generation
const token = jwt.sign({ id: userId }, JWT_SECRET, {
  expiresIn: "7d"
});

// Secure Cookie Settings
res.cookie("token", token, {
  httpOnly: true,                    // Prevents XSS
  secure: NODE_ENV === "production", // HTTPS only in production
  maxAge: 7 * 24 * 60 * 60 * 1000   // 7 days
});
```

### Security Measures
1. **Password Hashing**: bcrypt with salt rounds
2. **HTTP-Only Cookies**: Prevents XSS attacks
3. **Secure Cookies**: HTTPS-only in production
4. **Token Expiration**: Automatic logout after 7 days
5. **Input Validation**: Server-side validation for all inputs
6. **SQL Injection Prevention**: Drizzle ORM with parameterized queries
7. **CORS Configuration**: Restricted cross-origin requests
8. **Rate Limiting**: Prevents brute force attacks

---

## 🚨 Error Handling

### Backend Error Responses
```typescript
// Standard Error Format
{
  "success": false,
  "message": "Specific error description"
}
```

### Common Error Scenarios

1. **Signup Errors**
   - User already exists
   - Missing required fields
   - Invalid email format
   - Weak password

2. **Login Errors**
   - Invalid email
   - Invalid password
   - Account not verified

3. **Verification Errors**
   - Invalid verification code
   - Expired verification code
   - Code already used

4. **Password Reset Errors**
   - Email not found
   - Invalid reset token
   - Expired reset token

### Frontend Error Handling
```typescript
// Store-based error management
try {
  await authStore.signup(email, password, name, role);
} catch (error) {
  // Error automatically set in store.error
  // UI displays error message to user
}
```

---

## ⚙️ Environment Setup

### Backend Environment Variables
```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/connectq

# JWT
JWT_SECRET=your-super-secure-jwt-secret

# Email Service
USER_EMAIL=your-app-email@gmail.com
USER_PASSWORD=your-app-password

# Client URL
CLIENT_URL=http://localhost:5173

# Server
NODE_ENV=development
PORT=5000
```

### Frontend Environment Variables
```env
# API Base URL
VITE_API_URL=http://localhost:5000
```

---

## 🔄 State Management Flow

### 1. Application Startup
```typescript
// App initialization
useEffect(() => {
  authStore.loadRoleFromStorage();  // Load saved role
  authStore.checkAuth();           // Verify current auth
}, []);
```

### 2. Role Selection Persistence
```typescript
// Role selection flow
const handleRoleSelect = (role: Role) => {
  authStore.setRoleChoice(role);     // Save to localStorage
  navigate('/signup');               // Proceed to signup
};
```

### 3. Authentication State Updates
```typescript
// Automatic state synchronization
- Login success → isAuthenticated: true, user: data
- Logout → isAuthenticated: false, user: null, clear localStorage
- Token expiry → automatic logout and state clear
- Page refresh → checkAuth() validates current session
```

---

## 📱 User Experience Features

### 1. **Seamless Role Management**
- Role choice persists across browser sessions
- Visual indicators for selected role
- Easy role switching before signup

### 2. **Smart Loading States**
- Loading indicators during API calls
- Disabled buttons during processing
- Smooth transitions between states

### 3. **Error Recovery**
- Clear error messages
- Retry mechanisms for failed operations
- Automatic error clearing on success

### 4. **Session Management**
- Automatic login on app reload
- Graceful session expiry handling
- Secure logout with complete state clearing

---

## 🛠️ Development Workflow

### 1. **Adding New Auth Features**
1. Update database schema if needed
2. Add repository methods
3. Implement controller logic
4. Create/update API routes
5. Update frontend store
6. Add UI components
7. Test complete flow

### 2. **Testing Authentication**
```bash
# Backend tests
npm run test:auth

# Frontend testing
npm run test:e2e

# Manual testing flows
- Complete signup → verification → login
- Password reset flow
- Role persistence testing
- Session expiry testing
```

---

## 📊 Monitoring & Logging

### Backend Logging
```typescript
// Comprehensive logging
logger.info(`User signed up: ${user.email}`);
logger.info(`Email verified: ${user.email}`);
logger.info(`User logged in: ${user.email}`);
logger.error(`Login failed for: ${email}`);
```

### Key Metrics to Monitor
- Signup conversion rates
- Email verification rates
- Login success/failure rates
- Password reset usage
- Session duration
- Error rates by endpoint

---

This authentication system provides a robust, secure, and user-friendly experience while maintaining best practices for security and state management. The modular design allows for easy extension and maintenance as the application grows.