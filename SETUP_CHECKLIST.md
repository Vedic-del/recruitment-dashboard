# Setup Checklist ✅

## Pre-Setup Requirements

- [ ] Node.js 18+ installed (`node --version`)
- [ ] npm installed (`npm --version`)
- [ ] PostgreSQL 14+ installed (`psql --version`)
- [ ] Code editor (VS Code recommended)
- [ ] Groq API key (from https://console.groq.com)

## Step 1: Get Groq API Key ⚡

- [ ] Go to https://console.groq.com
- [ ] Sign up for free account
- [ ] Create/copy API key
- [ ] Save API key somewhere safe

## Step 2: Setup PostgreSQL 🗄️

### Windows
- [ ] Download PostgreSQL installer
- [ ] Run installer
- [ ] Remember postgres password
- [ ] PostgreSQL starts automatically

### Mac
- [ ] `brew install postgresql`
- [ ] `brew services start postgresql`

### Linux
- [ ] `sudo apt-get install postgresql postgresql-contrib`
- [ ] `sudo systemctl start postgresql`

## Step 3: Setup Backend 🔧

```bash
# Navigate to backend directory
cd recruitment-dashboard/backend
```

- [ ] `npm install` (wait for completion)
- [ ] Create `.env` file with:
  ```
  PORT=5000
  NODE_ENV=development
  DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/recruitment_db
  GROQ_API_KEY=YOUR_GROQ_KEY
  FRONTEND_URL=http://localhost:3000
  UPLOAD_DIR=./uploads
  ```
- [ ] Create database: `createdb recruitment_db`
- [ ] Start server: `npm run dev`
- [ ] Verify server running at http://localhost:5000/api/health
- [ ] Keep this terminal open

## Step 4: Setup Frontend 🎨

In new terminal:

```bash
cd recruitment-dashboard/frontend
```

- [ ] `npm install` (wait for completion)
- [ ] `.env.local` should have: `VITE_API_URL=http://localhost:5000`
- [ ] Start dev server: `npm run dev`
- [ ] Verify frontend at http://localhost:3000
- [ ] Keep this terminal open

## Step 5: First Time Usage 🚀

Open http://localhost:3000 in browser:

### Create Department
- [ ] Go to "Departments" tab
- [ ] Click "Add Department"
- [ ] Enter: "Engineering"
- [ ] See department created

### Add Hiring Manager (via Backend)
For now, use curl or Postman:
```bash
curl -X POST http://localhost:5000/api/hiring-managers \
  -H "Content-Type: application/json" \
  -d '{"name": "John Doe", "email": "john@company.com", "departments": []}'
```
- [ ] Copy the manager ID from response

### Create Position
- [ ] Go to "Positions" tab
- [ ] Click "Create Position"
- [ ] Fill:
  - Title: "Senior Software Engineer"
  - Department: "Engineering"
  - Hiring Manager: (select from dropdown)
  - Level: "Senior"
  - Skills: "React, Node.js, PostgreSQL"
- [ ] Click "Create Position"
- [ ] Watch AI generate JD!
- [ ] See position created

### Upload Resume
- [ ] Go to "Candidates" tab
- [ ] Drag and drop a resume file (or click to upload)
- [ ] Wait for processing
- [ ] See candidate created with extracted data
- [ ] Review: Name, Email, Skills, Experience

### View Pipeline
- [ ] Go to "Pipeline" tab
- [ ] Should be empty initially
- [ ] To see candidates, first create application via API:
```bash
curl -X POST http://localhost:5000/api/applications \
  -H "Content-Type: application/json" \
  -d '{"candidate_id": "CANDIDATE_ID", "position_id": "POSITION_ID"}'
```
- [ ] Refresh pipeline
- [ ] See candidate card with score

### Test Interview Feedback
- [ ] Click on candidate card in pipeline
- [ ] Add interview feedback:
  - Round: 1
  - Technical Score: 4
  - Communication Score: 5
  - Notes: "Strong technical knowledge"
- [ ] Click "Save Feedback"
- [ ] See feedback saved

### View Dashboard
- [ ] Go to "Dashboard" tab
- [ ] See summary stats
- [ ] Check quick start guide

## Step 6: Verify Everything Works ✅

- [ ] Backend running at http://localhost:5000
- [ ] Frontend running at http://localhost:3000
- [ ] Can create departments
- [ ] Can create positions (AI generates JD)
- [ ] Can upload resumes (AI extracts data)
- [ ] Can view dashboard with stats
- [ ] Can see pipeline

## Common Issues & Solutions

### "Database connection error"
```bash
# Check PostgreSQL is running
psql -U postgres

# If it fails, start PostgreSQL:
# Mac: brew services start postgresql
# Linux: sudo systemctl start postgresql
# Windows: Check Services → PostgreSQL
```

### "Cannot find module 'groq-sdk'"
```bash
# Make sure in correct directory
cd backend
npm install
npm run dev
```

### "Cannot find module 'react'"
```bash
cd frontend
npm install
npm run dev
```

### "Port 5000 already in use"
```bash
# Change PORT in backend/.env to 5001
# Update VITE_API_URL in frontend/.env.local to http://localhost:5001
```

### "Groq API error"
- Check GROQ_API_KEY in backend/.env
- Get new key from https://console.groq.com
- Restart backend with new key

## Next Steps 🎯

- [ ] Explore all features in the dashboard
- [ ] Create multiple departments
- [ ] Create multiple positions
- [ ] Upload multiple resumes
- [ ] Test pipeline workflow
- [ ] Check reports and analytics
- [ ] Review IMPLEMENTATION_SUMMARY.md for architecture details

## Deployment Checklist (Later)

When ready to deploy:

- [ ] Push code to GitHub
- [ ] Deploy backend to Railway:
  - [ ] Create Railway account
  - [ ] Connect GitHub repo
  - [ ] Add PostgreSQL
  - [ ] Set environment variables
  - [ ] Deploy
  
- [ ] Deploy frontend to Vercel:
  - [ ] Create Vercel account
  - [ ] Connect GitHub repo
  - [ ] Set VITE_API_URL to Railway backend
  - [ ] Deploy

- [ ] Test deployed version
- [ ] Share with team

## You're Ready! 🎉

All systems are ready. Follow the checklist above and you'll have a working recruitment dashboard in less than 30 minutes!

**Questions?** Check:
1. QUICKSTART.md - 5-minute guide
2. README.md - Full documentation
3. IMPLEMENTATION_SUMMARY.md - Architecture & features

Good luck! 🚀
