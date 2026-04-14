# 🚀 Quick Start Guide - 5 Minutes to Running

## Prerequisites
- Node.js v18+ installed
- PostgreSQL installed and running
- Port 3001 and 5173 are available

## Step 1: Create Database (1 minute)

```bash
# Using command line
createdb st_clare_filing_db

# OR using PostgreSQL client
psql -U postgres -c "CREATE DATABASE st_clare_filing_db;"
```

## Step 2: Setup Backend (1 minute)

```bash
cd backend
cp .env.example .env

# Edit .env and update DATABASE_URL if using different credentials
# Example: DATABASE_URL="postgresql://postgres:password@localhost:5432/st_clare_filing_db"

npm install
npm run prisma:generate
npm run prisma:migrate  # name it "init" when prompted
```

## Step 3: Create Admin User

```bash
# Option A: Using API (after starting backend)
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username":"admin",
    "email":"admin@stclare.edu",
    "password":"admin123",
    "fullName":"Administrator"
  }'

# Option B: Start backend, login will auto-create on first login attempt
```

## Step 4: Start Backend (Terminal 1)

```bash
cd backend
npm run dev

# Should show:
# 🚀 St. Clare Filing System API Server
# 📍 Running on http://localhost:3001
```

## Step 5: Start Frontend (Terminal 2)

```bash
# From project root
npm install
npm run dev

# Should show:
# ➜  Local: http://localhost:5173/
```

## Step 6: Test Login

1. Open: **http://localhost:5173/login.html**
2. Username: **admin**
3. Password: **admin123**
4. Click "Sign In"
5. ✅ Should see dashboard at http://localhost:5173/index.html

---

## 🔑 Demo Credentials

| Field | Value |
|-------|-------|
| Username | admin |
| Password | admin123 |
| Email | admin@stclare.edu |

---

## 📁 Key Files

| File | Purpose |
|------|---------|
| `src/login.html` | Login page with API integration |
| `src/js/auth/AuthService.js` | API client for authentication |
| `src/js/auth/authGuard.js` | Route protection logic |
| `backend/src/server.js` | Express server |
| `backend/src/controllers/authController.js` | Login/register logic |
| `backend/prisma/schema.prisma` | Database schema|
| `.env` (in backend) | Configuration |

---

## ✅ Verification Checklist

- [ ] Backend running on port 3001
- [ ] Frontend running on port 5173
- [ ] Can access http://localhost:5173/login.html
- [ ] Can login with admin/admin123
- [ ] Dashboard loads after login
- [ ] User info displays in top-right
- [ ] Refresh page keeps you logged in
- [ ] Logout button works

---

## 🐛 Troubleshooting Quick Fixes

| Problem | Fix |
|---------|-----|
| "Cannot connect to database" | Make sure PostgreSQL is running and DATABASE_URL in `.env` is correct |
| "Cannot POST /api/auth/login" | Backend not running - run `npm run dev` in backend folder |
| "Module not found" errors | Run `npm install` in the folder with missing modules |
| Page always redirects to login | Check backend is running and API is responding |
| "CORS error" | Check backend is on port 3001, frontend is on 5173 |

---

## 📖 Full Documentation

- `SETUP_GUIDE.md` - Complete setup instructions with all details
- `AUTHENTICATION_GUIDE.md` - How authentication works under the hood
- `TESTING_CHECKLIST.md` - Comprehensive testing guide

---

## 🎯 Next Commands to Know

```bash
# Backend
cd backend
npm run dev              # Start development server
npm run prisma:studio   # Open Prisma database visualizer
npm run prisma:migrate  # Run migration
npm run prisma:reset    # Reset database (⚠️ WARNING: Deletes all data)

# Frontend
npm run dev             # Start Vite dev server
npm run build           # Build for production
npm run preview         # Preview production build
npm run lint            # Check code quality
```

---

**Now go test it! Open http://localhost:5173/login.html and login with admin/admin123** ✨
