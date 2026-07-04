import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { query } from './config/database.js';
import departmentsRouter from './routes/departments.js';
import hiringManagersRouter from './routes/hiringManagers.js';
import positionsRouter from './routes/positions.js';
import candidatesRouter from './routes/candidates.js';
import applicationsRouter from './routes/applications.js';
import reportsRouter from './routes/reports.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Initialize database tables
async function initializeDatabase() {
  try {
    console.log('Initializing database...');

    // Create tables
    await query(`
      CREATE TABLE IF NOT EXISTS departments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL UNIQUE,
        active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS hiring_managers (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255),
        departments UUID[] DEFAULT '{}',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS positions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title VARCHAR(255) NOT NULL,
        department_id UUID NOT NULL REFERENCES departments(id),
        hiring_manager_id UUID NOT NULL REFERENCES hiring_managers(id),
        status VARCHAR(50) DEFAULT 'Open',
        requirements JSONB,
        generated_jd TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        closed_at TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS candidates (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        resume_file VARCHAR(255),
        resume_full_text TEXT,
        extracted_data JSONB,
        status VARCHAR(50) DEFAULT 'New',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS applications (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        candidate_id UUID NOT NULL REFERENCES candidates(id),
        position_id UUID NOT NULL REFERENCES positions(id),
        status VARCHAR(50) DEFAULT 'Applied',
        groq_score INTEGER,
        interview_feedback JSONB,
        time_in_stage JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(candidate_id, position_id)
      )
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS candidate_rejection_reasons (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        application_id UUID NOT NULL REFERENCES applications(id),
        reason TEXT,
        suggested_alternatives UUID[],
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS smart_recommendations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        candidate_id UUID NOT NULL REFERENCES candidates(id),
        suggested_position_ids UUID[],
        match_reason TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(candidate_id)
      )
    `);

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
  }
}

// Routes
app.use('/api/departments', departmentsRouter);
app.use('/api/hiring-managers', hiringManagersRouter);
app.use('/api/positions', positionsRouter);
app.use('/api/candidates', candidatesRouter);
app.use('/api/applications', applicationsRouter);
app.use('/api/reports', reportsRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Start server
async function start() {
  await initializeDatabase();

  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}

start().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});

export default app;
