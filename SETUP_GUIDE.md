# St. Clare College Filing System - Authentication Setup Guide

## 🎯 Overview

This guide walks you through setting up and testing the complete authentication system for the St. Clare College Filing System with:
- **Backend**: Express.js + PostgreSQL + Prisma ORM
- **Frontend**: Vanilla JavaScript + Vite
- **Authentication**: JWT tokens stored in localStorage
- **Security**: Password hashing with bcryptjs, secure token validation

---

## 📋 Prerequisites

Before you begin, ensure you have installed:
- **Node.js** (v18 or higher) - [Download](https://nodejs.org)
- **PostgreSQL** (v12 or higher) - [Download](https://www.postgresql.org/download)
- **Git** (optional, for version control)

Verify installations:
```bash
node --version      # Should show v18.0.0 or higher
npm --version       # Should show v9.0.0 or higher
postgres --version  # Should show PostgreSQL version
```

**Note for your system**: PostgreSQL is installed at `D:\postg` and runs on **port 3000** (not the default 5432).

---

## 🚀 Setup Instructions

### Step 1: Create PostgreSQL Database

**First, ensure PostgreSQL is running:**

On Windows, start PostgreSQL with:
```bash
& "D:\postg\bin\pg_ctl" -D "D:\postg\data" start
```

Then, create the database (on port 3000):
```bash
psql -U postgres -p 3000 -c "CREATE DATABASE st_clare_filing_db;"
```

Verify creation:
```bash
psql -U postgres -p 3000 -c "\l"
```

### Step 2: Backend Setup

Navigate to the backend directory and install dependencies:

```bash
cd backend
npm install
```

### Step 3: Configure Environment Variables

Create a `.env` file in the `backend` folder (copy from `.env.example`):

```bash
cp .env.example .env
```

Edit `backend/.env` with your database connection:

```env
# Database Configuration
DATABASE_URL="postgresql://postgres@localhost:3000/st_clare_filing_db"

# Note: PostgreSQL is running on port 3000
# Replace 'postgres' with your PostgreSQL username if different
# Add password if your postgres account requires one: postgresql://username:password@localhost:3000/st_clare_filing_db

# JWT Configuration (keep as is for development)
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_EXPIRY="7d"

# Server Configuration
PORT=3001
NODE_ENV="development"
FRONTEND_URL="http://localhost:5173"
CORS_ORIGIN="http://localhost:5173"
```

### Step 4: Initialize Prisma and Database

In the `backend` directory, run Prisma migrations:

```bash
# Generate Prisma client
npm run prisma:generate

# Run database migrations (creates tables)
npm run prisma:migrate

# You'll be prompted to name the migration, e.g., "init"
```

This creates all necessary tables in your PostgreSQL database.

### Step 5: Seed Admin User (Optional)

If you want to manually create the admin user with credentials `admin / admin123`, you can use Prisma Studio:

```bash
npm run prisma:studio
```

Or create via SQL:

```sql
-- Open psql for st_clare_filing_db
-- Password hash for "admin123" using bcryptjs with 10 salt rounds
-- Use: const bcrypt = require('bcryptjs'); bcrypt.hashSync('admin123', 10)

INSERT INTO "User" (id, username, password, email, "fullName", role, "isActive", "createdAt", "updatedAt")
VALUES (
  'user_admin_001',
  'admin',
 '$2a$10$YourHashedPasswordHere',  // Replace with actual bcrypt hash
  'admin@stclare.edu',
  'Administrator',
  'admin',
  true,
  NOW(),
  NOW()
);
```

**Better approach**: Start the backend and use the login endpoint to register:

```bash
# Start backend first, then:
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","email":"admin@stclare.edu","password":"admin123","fullName":"Administrator"}'
```

### Step 6: Start Backend Server

In the `backend` directory:

```bash
npm run dev
# OR
npm start
```

Expected output:
```
🚀 St. Clare Filing System API Server
📍 Running on http://localhost:3001
🌍 Environment: development
🔐 CORS enabled for: http://localhost:5173
```

**Keep this terminal open** - the backend needs to stay running.

### Step 7: Frontend Setup

Open a **new terminal** and navigate to the project root:

```bash
cd ..  # Go back to project root
npm install
```

### Step 8: Start Frontend Development Server

```bash
npm run dev
```

Expected output:
```
  VITE v5.0.0  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Press h to show help
```

Open your browser and navigate to: **http://localhost:5173/login.html**

---

## 🧪 Testing Checklist

### Test 1: Login Page Loads
- [ ] Navigate to `http://localhost:5173/login.html`
- [ ] Page displays correctly with form and hero section
- [ ] Form validation works (try submitting empty form)
- [ ] Error message appears: "Please enter both username and password"

### Test 2: Successful Login
- [ ] Username: `admin`
- [ ] Password: `admin123`
- [ ] Click "Sign In"
- [ ] Loading spinner appears briefly
- [ ] Success message: "Login successful! Redirecting..."
- [ ] Redirected to `/index.html` after ~1 second
- [ ] Dashboard loads successfully

### Test 3: Failed Login
- [ ] Go back to login page
- [ ] Username: `admin`
- [ ] Password: `wrongpassword`
- [ ] Click "Sign In"
- [ ] Error message appears: "Invalid username or password"
- [ ] Button becomes clickable again (not stuck in loading)

### Test 4: Invalid Credentials
- [ ] Username: `nonexistent`
- [ ] Password: `somepassword`
- [ ] Click "Sign In"
- [ ] Error message appears: "Invalid username or password"

### Test 5: Authentication Persistence
- [ ] Login with correct credentials
- [ ] Refresh the page (F5)
- [ ] Dashboard remains visible (no redirect to login)
- [ ] User info displays correctly in top-right

### Test 6: Token Expiration
- [ ] Login successfully
- [ ] Wait 7 days (OR manually edit localStorage to set expiry to current time for testing)
- [ ] Refresh page or navigate
- [ ] Should redirect to login page

### Test 7: Logout Functionality
- [ ] Login successfully
- [ ] Click user profile in top-right
- [ ] Click "Log out" button
- [ ] Confirmation dialog appears
- [ ] After confirmation, redirected to login page
- [ ] localStorage is cleared (tokens removed)

### Test 8: Protected Route Access
- [ ] Logout from application
- [ ] Open DevTools (F12) → Console
- [ ] Manually run: `localStorage.removeItem('auth_token')`
- [ ] Manually navigate to `http://localhost:5173/index.html`
- [ ] Should redirect to login page

### Test 9: API Communication
- [ ] Open DevTools → Network tab
- [ ] Login with valid credentials
- [ ] Check Network tab → should see POST request to `/api/auth/login`
- [ ] Response should contain:
  ```json
  {
    "success": true,
    "message": "Login successful",
    "data": {
      "user": { "id":..., "username":"admin", ... },
      "token": "eyJhbGc..."
    }
  }
  ```

### Test 10: Browser Compatibility
- [ ] Test in Chrome ✓
- [ ] Test in Firefox ✓
- [ ] Test in Safari ✓
- [ ] Test in Edge ✓

---

## 🔧 Troubleshooting

### Issue: "Cannot connect to database"
**Solution**:
1. Ensure PostgreSQL is running:
   ```bash
   & "D:\postg\bin\pg_ctl" -D "D:\postg\data" start
   ```
2. Verify you can connect (note port 3000):
   ```bash
   psql -U postgres -p 3000 -c "SELECT version();"
   ```
3. Check `DATABASE_URL` in `.env` includes port 3000:
   ```env
   DATABASE_URL="postgresql://postgres@localhost:3000/st_clare_filing_db"
   ```
4. Verify database exists:
   ```bash
   psql -U postgres -p 3000 -c "\l"
   ```

### Issue: "CORS error" or "No Access-Control-Allow-Origin"
**Solution**:
1. Ensure backend is running on port 3001
2. Check Vite proxy is configured in `vite.config.js`
3. Verify `CORS_ORIGIN` in `backend/.env` matches frontend URL

### Issue: "Module not found" Errors
**Solution**:
```bash
# In backend/
npm install

# In root (frontend)/
npm install
```

### Issue: "Can't find module './js/auth/AuthService.js'"
**Solution**:
1. Ensure file exists at `src/js/auth/AuthService.js`
2. Check file is created correctly with no typos in path
3. Verify import statement uses correct `./` relative path

### Issue: Tokens not being saved
**Solution**:
1. Check browser allows localStorage (not in private mode)
2. Browser console should not show storage quota exceeded
3. Open DevTools → Application → LocalStorage → Check `auth_token` key exists after login

---

## 📁 File Structure

```
project-root/
├── backend/
│   ├── src/
│   │   ├── server.js              # Express server entry point
│   │   ├── controllers/
│   │   │   └── authController.js  # Auth logic
│   │   ├── routes/
│   │   │   └── authRoutes.js      # Auth endpoints
│   │   ├── middleware/
│   │   │   └── auth.js            # JWT verification
│   │   └── utils/
│   │       ├── jwt.js             # JWT functions
│   │       └── password.js        # Password hashing
│   ├── prisma/
│   │   └── schema.prisma          # Database schema
│   ├── .env                       # Environment variables
│   └── package.json
│
├── src/
│   ├── login.html                 # Login page
│   ├── index.html                 # Dashboard (protected)
│   ├── js/
│   │   ├── auth/
│   │   │   ├── AuthService.js    # Auth API client
│   │   │   └── authGuard.js      # Route protection
│   │   ├── main.js               # App initialization
│   │   └── storage/
│   │       └── FileSystemService.js
│   └── css/
│       └── style.css
│
├── vite.config.js                # API proxy config
├── package.json
└── README.md
```

---

## 🔐 Security Notes

### For Production

Before deploying to production, make these changes:

1. **Change JWT Secret**:
   ```env
   JWT_SECRET="very-long-random-string-at-least-32-characters"
   ```
   Generate with: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

2. **Enable HTTPS**:
   - Use SSL certificates
   - Update `FRONTEND_URL` and `CORS_ORIGIN` to `https://...`

3. **Secure Cookies** (alternative to localStorage):
   - Switch from localStorage to HttpOnly cookies
   - Update AuthService to use cookies instead

4. **Rate Limiting**:
   - Add rate limiting to auth endpoints to prevent brute force
   - Use package like `express-rate-limit`

5. **Input Validation**:
   - Add stronger validation for username/email
   - Sanitize all input

6. **Update Password Requirements**:
   - Enforce stronger passwords (minimum 12 chars, special chars)
   - Add password reset functionality

---

## 📚 API Endpoints Reference

Base URL: `http://localhost:3001/api/auth`

### Login
```
POST /api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}

Response:
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {...},
    "token": "jwt_token_here"
  }
}
```

### Register
```
POST /api/auth/register
{
  "username": "newuser",
  "email": "user@example.com",
  "password": "password123",
  "fullName": "Full Name"
}
```

### Get Current User (Protected)
```
GET /api/auth/me
Authorization: Bearer {token}
```

### Update Profile (Protected)
```
PUT /api/auth/profile
Authorization: Bearer {token}
{
  "fullName": "New Name",
  "email": "newemail@example.com"
}
```

### Change Password (Protected)
```
POST /api/auth/change-password
Authorization: Bearer {token}
{
  "currentPassword": "old123",
  "newPassword": "new456"
}
```

---

## 🎓 Understanding the Auth Flow

### 1. **User visits `/login.html`**
   - AuthService checks `localStorage` for existing token
   - If valid token found, redirect to `/index.html`

### 2. **User submits login form**
   - Credentials sent to `POST /api/auth/login`
   - Backend validates username/password
   - Backend returns JWT token

### 3. **Token is stored**
   - AuthService saves token in `localStorage.auth_token`
   - Token expiry stored in `localStorage.auth_token_expiry`

### 4. **User navigates to `/index.html`**
   - Auth guard runs (before main app)
   - Checks if token exists and is valid
   - Calls `GET /api/auth/me` to verify token
   - If valid, loads user data and shows dashboard
   - If invalid, redirects to login

### 5. **API requests include token**
   - All authenticated API calls use `Authorization: Bearer {token}` header
   - AuthService handles this automatically via `authenticatedFetch()`

### 6. **User clicks logout**
   - Token removed from localStorage
   - Redirect to login page
   - User must login again next time

---

## 📞 Support & Next Steps

After successful setup:

1. **Customize user roles** - Update `user.role` in database
2. **Add more features** - File upload, file management, etc.
3. **Deploy** - Use services like Heroku, AWS, DigitalOcean
4. **Database backups** - Set up automated backups
5. **Monitoring** - Add logging and error tracking

---

## Version Info

- **Node.js**: v18+
- **Express**: v4.18+
- **Prisma**: v5.9+
- **Vite**: v5.0+
- **PostgreSQL**: v12+

Last Updated: April 2026
