# Quick Start Guide - HR Recruitment Dashboard

## 🚀 Get Running in 5 Minutes

### Step 1: Get Your Groq API Key (2 minutes)

1. Go to https://console.groq.com
2. Sign up for free (no credit card needed)
3. Generate an API key
4. Save it somewhere safe

### Step 2: Install PostgreSQL (if not installed)

**On Windows:**
- Download from https://www.postgresql.org/download/windows/
- Install and remember the password for `postgres` user

**On Mac:**
```bash
brew install postgresql
brew services start postgresql
```

**On Linux:**
```bash
sudo apt-get install postgresql postgresql-contrib
sudo systemctl start postgresql
```

### Step 3: Setup Backend

```bash
cd backend

# Install dependencies
npm install

# Create .env file
# Copy the content below and fill in your values:
cat > .env << EOF
PORT=5000
NODE_ENV=development
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/recruitment_db
GROQ_API_KEY=your_groq_api_key_here
FRONTEND_URL=http://localhost:3000
UPLOAD_DIR=./uploads
EOF

# Create database
createdb recruitment_db

# Start backend server
npm run dev
```

**Expected output:**
```
Server running on port 5000
Database initialized successfully
```

### Step 4: Setup Frontend (in new terminal)

```bash
cd frontend

# Install dependencies
npm install

# Start frontend server
npm run dev
```

**Expected output:**
```
VITE v5.0.0  ready in 234 ms

➜  Local:   http://localhost:3000/
```

### Step 5: Open in Browser

Go to **http://localhost:3000** 🎉

## 📝 First Time Setup Inside App

1. **Create Department** (e.g., "Engineering", "Sales", "HR")
   - Go to Departments tab → Add Department

2. **Add Hiring Manager**
   - Go to backend config or use dashboard
   - Create hiring managers for each department

3. **Create First Position**
   - Go to Positions tab → Create Position
   - Fill in: Title, Department, Hiring Manager, Level, Skills
   - Watch AI generate a professional JD!

4. **Upload Test Resume**
   - Go to Candidates tab
   - Upload any resume file
   - See AI extract candidate info automatically

5. **View Pipeline**
   - Go to Pipeline tab
   - See your candidates organized by stage

## 🔧 Common Issues

### "Cannot find module" error
```bash
# Make sure you're in the right directory and dependencies are installed
npm install
npm run dev
```

### Database connection error
```bash
# Check if PostgreSQL is running
psql -U postgres

# If not running:
# On Mac: brew services start postgresql
# On Linux: sudo systemctl start postgresql
# On Windows: Check Services → PostgreSQL
```

### Groq API errors
```bash
# Make sure GROQ_API_KEY in backend/.env is correct
# Get a new key at https://console.groq.com
```

### Port already in use
```bash
# Change PORT in backend/.env (e.g., 5001)
# Change port in frontend/vite.config.ts (e.g., 3001)
```

## 📚 Next Steps

After setup is working:

1. **Explore the dashboard** - Check out all the features
2. **Upload sample resumes** - Test the AI parsing
3. **Create test positions** - See JD generation in action
4. **Try the pipeline** - Move candidates through stages
5. **Check reports** - View analytics and metrics

## 🚀 Ready to Deploy?

Once you're happy with the local version:

### Deploy Backend to Railway (FREE)

1. Push code to GitHub
2. Go to railway.app → New Project → GitHub repo
3. Add PostgreSQL addon
4. Set environment variables
5. Deploy! ✅

### Deploy Frontend to Vercel (FREE)

1. Push code to GitHub
2. Go to vercel.com → Import project
3. Set `VITE_API_URL` to your Railway backend URL
4. Deploy! ✅

## 📞 Need Help?

Check `README.md` for detailed documentation and API reference.

Enjoy your new recruitment dashboard! 🎯
