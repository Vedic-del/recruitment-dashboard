# CFM Asset Reconstruction - Recruitment Dashboard

An AI-powered recruitment management system that helps track hiring pipelines, automate candidate screening, and manage job openings across multiple departments.

## Features

- 🤖 **AI-Powered JD Generation**: Automatically generate professional job descriptions using Groq AI
- 📄 **Resume Parsing**: Extract candidate information from resumes automatically
- 📊 **Candidate Scoring**: AI-based matching of candidates to job requirements
- 🔄 **Pipeline Management**: Drag-and-drop candidate workflow through interview stages
- 📈 **Analytics & Reports**: Track time-to-fill, pipeline health, and hiring metrics
- 🎯 **Smart Recommendations**: Get suggestions for alternative roles when rejecting candidates
- 👥 **Department Management**: Organize hiring by departments and hiring managers

## Tech Stack

- **Frontend**: React 18 + TypeScript + Tailwind CSS
- **Backend**: Node.js + Express.js + TypeScript
- **Database**: PostgreSQL
- **AI**: Groq API (Mixtral 8x7b)
- **Hosting**: Railway (backend + DB), Vercel (frontend)

## Prerequisites

- Node.js 18+
- PostgreSQL 14+
- Groq API key (free at https://console.groq.com)
- Git

## Local Setup

### 1. Clone and Setup Directories

```bash
cd recruitment-dashboard
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create `.env` file:

```env
PORT=5000
NODE_ENV=development
DATABASE_URL=postgresql://user:password@localhost:5432/recruitment_db
GROQ_API_KEY=your_groq_api_key_here
FRONTEND_URL=http://localhost:3000
UPLOAD_DIR=./uploads
```

### 3. Database Setup

```bash
# Create PostgreSQL database
createdb recruitment_db

# Run migrations (if migrations are available)
npm run migrate
```

### 4. Start Backend Server

```bash
npm run dev
```

Backend will be available at `http://localhost:5000`

### 5. Frontend Setup

In a new terminal:

```bash
cd frontend
npm install
```

Create `.env.local`:

```env
VITE_API_URL=http://localhost:5000
```

### 6. Start Frontend Server

```bash
npm run dev
```

Frontend will be available at `http://localhost:3000`

## Usage

1. **Create Departments**: Go to Departments tab and add your company's departments
2. **Create Hiring Managers**: Set up hiring managers for each department
3. **Create Positions**: Add job openings - AI will auto-generate JD
4. **Upload Candidates**: Upload resumes - AI will extract information
5. **Manage Pipeline**: Drag candidates through interview stages
6. **Add Feedback**: Record interview feedback for each round
7. **View Reports**: Check pipeline health and analytics

## API Endpoints

### Departments
- `GET /api/departments` - List all departments
- `POST /api/departments` - Create department
- `PUT /api/departments/:id` - Update department
- `DELETE /api/departments/:id` - Delete department

### Hiring Managers
- `GET /api/hiring-managers` - List all
- `POST /api/hiring-managers` - Create
- `PUT /api/hiring-managers/:id` - Update
- `DELETE /api/hiring-managers/:id` - Delete

### Positions
- `GET /api/positions` - List with filters
- `POST /api/positions` - Create (auto-generates JD)
- `PUT /api/positions/:id` - Update
- `GET /api/positions/:id/candidates` - Get candidates for position

### Candidates
- `GET /api/candidates` - List candidates
- `POST /api/candidates/upload` - Upload resume
- `PUT /api/candidates/:id` - Update candidate
- `GET /api/candidates/:id/recommendations` - Get recommendations
- `DELETE /api/candidates/:id` - Delete candidate

### Applications
- `GET /api/applications` - List applications
- `POST /api/applications` - Create application (auto-scores)
- `POST /api/applications/:id/move-stage` - Move to next stage
- `PUT /api/applications/:id/feedback` - Add interview feedback

### Reports
- `GET /api/reports/pipeline` - Pipeline health report
- `GET /api/reports/time-to-fill` - Time-to-fill analytics
- `GET /api/reports/dashboard/summary` - Dashboard summary
- `GET /api/reports/department/:deptId` - Department report
- `GET /api/reports/hiring-manager/:hmId` - Manager report

## Deployment

### Deploy Backend to Railway

1. Push code to GitHub
2. Connect GitHub repo to Railway
3. Add PostgreSQL database to Railway
4. Set environment variables:
   - `DATABASE_URL`
   - `GROQ_API_KEY`
   - `FRONTEND_URL`
   - `PORT` (default: 5000)
5. Deploy

### Deploy Frontend to Vercel

1. Connect GitHub repo to Vercel
2. Set environment variable:
   - `VITE_API_URL` = your Railway backend URL
3. Deploy

## Project Structure

```
recruitment-dashboard/
├── backend/
│   ├── src/
│   │   ├── config/        # Database and Groq config
│   │   ├── routes/        # API endpoints
│   │   ├── services/      # Business logic
│   │   ├── types/         # TypeScript types
│   │   └── index.ts       # Entry point
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── pages/         # React pages
│   │   ├── App.tsx        # Main app
│   │   ├── main.tsx       # Entry point
│   │   └── index.css      # Tailwind CSS
│   ├── index.html
│   ├── package.json
│   └── vite.config.ts
├── database/
│   └── schema.sql         # Database schema
└── README.md
```

## Future Enhancements (Phase 3)

- CSV bulk import for historical data
- Email notifications on candidate advancement
- Advanced analytics and dashboards
- Integration with ATS systems
- Candidate communication portal
- Auto-scheduling of interviews
- Custom scoring rules
- Multi-language JD generation

## Troubleshooting

### Database Connection Error
- Ensure PostgreSQL is running
- Check `DATABASE_URL` in backend `.env`
- Verify database exists: `psql -l`

### Groq API Errors
- Get free API key from https://console.groq.com
- Check `GROQ_API_KEY` in backend `.env`
- Ensure you have API quota available

### CORS Errors
- Verify `FRONTEND_URL` is set in backend `.env`
- Check frontend is on correct port (3000)

### Resume Upload Issues
- Ensure `uploads/` directory exists or is created automatically
- Check file size limits
- Verify file format (PDF, DOC, TXT)

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review API logs: `npm run dev` shows detailed errors
3. Check browser console for frontend errors

## License

MIT

## Contributors

Built for CFM Asset Reconstruction Company
