# Clients API Documentation

## Overview
Complete CRUD API for client profiles and requests. Clients can create profiles, submit project requirements, and manage their request status.

## Base URL
```
/api/clients
```

## Authentication
All endpoints require authentication via JWT token. Use the `verifyToken` middleware.

## Role Requirements
- Most endpoints require `client` role
- `/open-requests` endpoint allows both `client` and `company` roles

## File Upload
Profile picture uploads are supported using multipart/form-data with field name `profilePic`.
- Supported formats: JPEG, JPG, PNG, GIF, WebP
- Maximum file size: 5MB
- Images are stored in Cloudinary under `clients/profiles/` folder

---

## Endpoints

### 1. Create Client Profile
**POST** `/api/clients`

Creates a new client profile for the authenticated user.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Body (Form Data):**
```
profilePic: File (optional) - Profile picture image
contactNumber: string (optional) - Client's contact number
bio: string (optional) - Client's bio/description
description: string (optional) - Project requirement description
status: string (optional) - Request status (open/matched/closed, defaults to 'open')
```

**Response:**
```json
{
  "success": true,
  "message": "Client profile created successfully",
  "client": {
    "id": "uuid",
    "userId": "uuid",
    "profilePicUrl": "https://cloudinary-url",
    "contactNumber": "+1234567890",
    "bio": "Client bio",
    "description": "Project requirements",
    "status": "open",
    "createdAt": "2025-01-01T00:00:00Z",
    "updatedAt": "2025-01-01T00:00:00Z"
  }
}
```

---

### 2. Get My Client Profile
**GET** `/api/clients/me`

Retrieves the current user's client profile.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "client": {
    "id": "uuid",
    "userId": "uuid",
    "profilePicUrl": "https://cloudinary-url",
    "contactNumber": "+1234567890",
    "bio": "Client bio",
    "description": "Project requirements",
    "status": "open",
    "createdAt": "2025-01-01T00:00:00Z",
    "updatedAt": "2025-01-01T00:00:00Z"
  }
}
```

---

### 3. Get Open Client Requests
**GET** `/api/clients/open-requests`

Retrieves all client requests with "open" status. Available to both clients and companies.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "requests": [
    {
      "id": "uuid",
      "userId": "uuid",
      "profilePicUrl": "https://cloudinary-url",
      "contactNumber": "+1234567890",
      "bio": "Client bio",
      "description": "Project requirements",
      "status": "open",
      "createdAt": "2025-01-01T00:00:00Z",
      "updatedAt": "2025-01-01T00:00:00Z"
    }
  ],
  "count": 1
}
```

---

### 4. Get Specific Client Profile
**GET** `/api/clients/:id`

Retrieves a specific client profile. Users can only access their own profile.

**Headers:**
```
Authorization: Bearer <token>
```

**Parameters:**
- `id`: Client profile UUID

**Response:**
```json
{
  "success": true,
  "client": {
    "id": "uuid",
    "userId": "uuid",
    "profilePicUrl": "https://cloudinary-url",
    "contactNumber": "+1234567890",
    "bio": "Client bio",
    "description": "Project requirements",
    "status": "open",
    "createdAt": "2025-01-01T00:00:00Z",
    "updatedAt": "2025-01-01T00:00:00Z"
  }
}
```

---

### 5. Update Client Profile
**PUT** `/api/clients/:id`

Updates a client profile. Users can only update their own profile.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Parameters:**
- `id`: Client profile UUID

**Body (Form Data):**
```
profilePic: File (optional) - New profile picture image
contactNumber: string (optional) - Updated contact number
bio: string (optional) - Updated bio/description
description: string (optional) - Updated project requirements
status: string (optional) - Updated status (open/matched/closed)
```

**Response:**
```json
{
  "success": true,
  "message": "Client profile updated successfully",
  "client": {
    "id": "uuid",
    "userId": "uuid",
    "profilePicUrl": "https://cloudinary-url",
    "contactNumber": "+1234567890",
    "bio": "Updated client bio",
    "description": "Updated project requirements",
    "status": "open",
    "createdAt": "2025-01-01T00:00:00Z",
    "updatedAt": "2025-01-01T10:00:00Z"
  }
}
```

---

### 6. Update Client Status
**PATCH** `/api/clients/:id/status`

Updates only the status of a client request.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Parameters:**
- `id`: Client profile UUID

**Body:**
```json
{
  "status": "matched" // or "open" or "closed"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Client status updated to matched",
  "client": {
    "id": "uuid",
    "userId": "uuid",
    "profilePicUrl": "https://cloudinary-url",
    "contactNumber": "+1234567890",
    "bio": "Client bio",
    "description": "Project requirements",
    "status": "matched",
    "createdAt": "2025-01-01T00:00:00Z",
    "updatedAt": "2025-01-01T10:00:00Z"
  }
}
```

---

### 7. Delete Client Profile
**DELETE** `/api/clients/:id`

Deletes a client profile and associated profile picture from Cloudinary.

**Headers:**
```
Authorization: Bearer <token>
```

**Parameters:**
- `id`: Client profile UUID

**Response:**
```json
{
  "success": true,
  "message": "Client profile deleted successfully"
}
```

---

## Error Responses

### Validation Errors
```json
{
  "success": false,
  "message": "User already has a client profile"
}
```

### Authentication Errors
```json
{
  "success": false,
  "message": "User not authenticated"
}
```

### Authorization Errors
```json
{
  "success": false,
  "message": "Access denied. Client role required."
}
```

### File Upload Errors
```json
{
  "success": false,
  "message": "Only image files (JPEG, JPG, PNG, GIF, WebP) are allowed!"
}
```

```json
{
  "success": false,
  "message": "File size too large. Maximum size is 5MB."
}
```

### Not Found Errors
```json
{
  "success": false,
  "message": "Client profile not found"
}
```

### Server Errors
```json
{
  "success": false,
  "message": "Internal server error"
}
```

---

## Status Values
- **open**: Client is actively looking for service providers
- **matched**: Client has found a service provider
- **closed**: Client request is closed/completed

---

## File Upload Notes
1. Profile pictures are automatically uploaded to Cloudinary
2. Old profile pictures are automatically deleted when updating
3. Temporary files are cleaned up after processing
4. Image optimization is handled by Cloudinary
5. File paths are validated for security
