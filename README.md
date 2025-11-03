# ConnectQ - AI-Powered Business Connection Platform

ConnectQ is a modern platform that connects clients with companies using AI-powered semantic search and intelligent matching. Built with React, Node.js, PostgreSQL, and Google Gemini AI.

## 🌟 Features

- **AI-Powered Search**: Semantic company discovery using Google Gemini embeddings
- **Smart Matching**: Vector-based similarity search with Pinecone database
- **Role-Based Access**: Separate dashboards for clients and companies
- **Interest Management**: Complete notification system for project interests
- **Real-time Updates**: Live notifications and status tracking
- **Professional UI**: Modern, responsive design with Framer Motion animations

## 🏗️ Architecture

```
Frontend (React + TypeScript + Tailwind CSS)
    ↓
Backend (Node.js + Express + TypeScript)
    ↓
PostgreSQL Database + Drizzle ORM
    ↓
AI Services (Google Gemini + Pinecone Vector DB)
```

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **npm** or **yarn** package manager
- **PostgreSQL** (v13 or higher) - [Download here](https://postgresql.org/download/)
- **Git** - [Download here](https://git-scm.com/downloads)

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/newcodesubed/ConnectQ.git
cd ConnectQ
```

### 2. Setup Backend

```bash
cd backend
npm install
```

### 3. Setup Frontend

```bash
cd ../frontend
npm install
```

## ⚙️ Environment Configuration

### Backend Environment Variables

Create a `.env` file in the `backend` directory:

```bash
cd backend
cp .env.example .env  # If example exists, or create new file
```

Add the following environment variables to `backend/.env`:

```env
# Server Configuration
PORT=5000
CLIENT_URL=http://localhost:5174

# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/connectq_db

# Authentication
JWT_SECRET=your_super_secret_jwt_key_here_min_32_chars

# Google Gemini AI (Required for AI features)
GEMINI_API_KEY=your_gemini_api_key_here

# Pinecone Vector Database (Required for AI search)
PINECONE_API_KEY=your_pinecone_api_key_here
PINECONE_INDEX_NAME=connectq-companies

# Cloudinary (Optional - for image uploads)
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

### Frontend Environment Variables

Create a `.env` file in the `frontend` directory (if needed):

```bash
cd frontend
```

```env
# API Configuration (usually not needed as it's hardcoded)
VITE_API_URL=http://localhost:5000
```

## 🔑 Required API Keys Setup

### 1. Google Gemini AI API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the API key and add it to your `.env` file as `GEMINI_API_KEY`

### 2. Pinecone API Key

1. Go to [Pinecone](https://www.pinecone.io/)
2. Sign up for a free account
3. Create a new project
4. Go to "API Keys" in your dashboard
5. Copy the API key and add it to your `.env` file as `PINECONE_API_KEY`
6. Create an index named `connectq-companies` with:
   - **Dimensions**: 1536
   - **Metric**: cosine
   - **Cloud**: AWS
   - **Region**: us-east-1

### 3. Cloudinary (Optional)

1. Go to [Cloudinary](https://cloudinary.com/)
2. Sign up for a free account
3. Go to your dashboard
4. Copy the Cloud Name, API Key, and API Secret
5. Add them to your `.env` file

## 🗄️ Database Setup

### 1. Create PostgreSQL Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE connectq_db;

# Create user (optional)
CREATE USER connectq_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE connectq_db TO connectq_user;

# Exit PostgreSQL
\q
```

### 2. Update Database URL

Update the `DATABASE_URL` in your `backend/.env` file:

```env
DATABASE_URL=postgresql://connectq_user:your_password@localhost:5432/connectq_db
```

### 3. Run Database Migrations

```bash
cd backend

# Generate migration files
npm run db:generate

# Apply migrations to database
npm run db:migrate

# Or push schema directly (for development)
npm run db:push
```

## 🏃‍♂️ Running the Application

### 1. Start Backend Server

```bash
cd backend
npm run dev
```

The backend will start on `http://localhost:5000`

### 2. Start Frontend Application

In a new terminal:

```bash
cd frontend
npm run dev
```

The frontend will start on `http://localhost:5174`

### 3. Initialize AI Embeddings (Optional)

To enable AI-powered search, initialize the embedding system:

```bash
cd backend
npm run embed:init
```

This will:
- Create the Pinecone index
- Embed any existing companies in the database
- Set up the vector search system

## 📱 Application Usage

### For Clients (Project Owners)

1. **Sign Up**: Create an account and select "Client" role
2. **Create Profile**: Fill out your client profile
3. **Post Project**: Create a project description in "My Project" tab
4. **Browse Companies**: Search for companies using AI-powered search
5. **Manage Interests**: Review company interests in "Notifications" tab

### For Companies (Service Providers)

1. **Sign Up**: Create an account and select "Company" role
2. **Complete Profile**: Add company details, services, and technologies
3. **Browse Projects**: View available client projects
4. **Express Interest**: Show interest in relevant projects
5. **Track Applications**: Monitor your expressed interests

## 🧪 Testing the Setup

### 1. Backend Health Check

Visit `http://localhost:5000` - should show "Server is running"

### 2. Database Connection

Check backend console for "Database connected successfully" message

### 3. AI Features

- Create a company profile
- Use the search feature to test semantic search
- Check browser console for any API errors

### 4. Frontend Navigation

- Sign up with different roles
- Navigate between dashboard tabs
- Test responsive design on different screen sizes

## 📚 Available Scripts

### Backend Scripts

```bash
npm run dev          # Start development server with nodemon
npm run db:generate  # Generate Drizzle migration files
npm run db:migrate   # Apply migrations to database
npm run db:push      # Push schema directly to database
npm run embed:init   # Initialize AI embedding system
npm run embed:cleanup # Clean up orphaned embeddings
```

### Frontend Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

## 🗂️ Project Structure

```
ConnectQ/
├── backend/
│   ├── src/
│   │   ├── config/          # Configuration files
│   │   ├── controllers/     # Route controllers
│   │   ├── middlewares/     # Custom middleware
│   │   ├── model/          # Database schemas
│   │   ├── repository/     # Data access layer
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   ├── scripts/        # Utility scripts
│   │   └── utils/          # Helper functions
│   ├── drizzle/            # Database migrations
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   ├── store/          # State management
│   │   ├── types/          # TypeScript types
│   │   └── utils/          # Helper functions
│   └── package.json
└── README.md
```

## 🛠️ Technology Stack

### Frontend
- **React 19** - UI framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **Zustand** - State management
- **React Router** - Navigation
- **Axios** - HTTP client

### Backend
- **Node.js** - Runtime
- **Express.js** - Web framework
- **TypeScript** - Type safety
- **Drizzle ORM** - Database ORM
- **PostgreSQL** - Database
- **JWT** - Authentication
- **Winston** - Logging

### AI & Search
- **Google Gemini AI** - Text embeddings
- **Pinecone** - Vector database
- **Semantic Search** - AI-powered matching

## 🐛 Troubleshooting

### Common Issues

#### Database Connection Error
```bash
# Check if PostgreSQL is running
sudo systemctl status postgresql  # Linux
brew services list | grep postgres  # macOS

# Verify database exists
psql -U postgres -l
```

#### Port Already in Use
```bash
# Find and kill process using port 5000
lsof -ti:5000 | xargs kill -9

# Or use different port in backend/.env
PORT=5001
```

#### AI Features Not Working
- Verify `GEMINI_API_KEY` is correct
- Check `PINECONE_API_KEY` and index name
- Run `npm run embed:init` to initialize embeddings
- Check browser console for API errors

#### Build Errors
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear TypeScript cache
npx tsc --build --clean
```

### Environment Variables Not Loading
- Ensure `.env` file is in correct directory
- Restart servers after changing environment variables
- Check for typos in variable names
- Verify no spaces around `=` sign

## 📞 Support

If you encounter issues:

1. Check the [troubleshooting section](#-troubleshooting)
2. Verify all environment variables are set correctly
3. Ensure all required services (PostgreSQL, Node.js) are running
4. Check browser console and server logs for error messages

## 🚀 Deployment

For production deployment:

1. Set up a production PostgreSQL database
2. Configure production environment variables
3. Build the frontend: `npm run build`
4. Use PM2 or similar for backend process management
5. Set up a reverse proxy (nginx) for serving static files
6. Configure SSL certificates for HTTPS

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

---

**Happy Coding! 🚀**

For more detailed information about specific features, check the documentation files in the `dis/` directory.