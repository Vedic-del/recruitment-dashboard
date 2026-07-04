-- Departments Table
CREATE TABLE IF NOT EXISTS departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL UNIQUE,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Hiring Managers Table
CREATE TABLE IF NOT EXISTS hiring_managers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  departments UUID[] DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Positions/Openings Table
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
);

-- Candidates Table
CREATE TABLE IF NOT EXISTS candidates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resume_file VARCHAR(255),
  resume_full_text TEXT,
  extracted_data JSONB,
  status VARCHAR(50) DEFAULT 'New',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Applications Table (Candidate -> Position mapping)
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
);

-- Candidate Rejection Reasons Table
CREATE TABLE IF NOT EXISTS candidate_rejection_reasons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES applications(id),
  reason TEXT,
  suggested_alternatives UUID[],
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Smart Recommendations Table
CREATE TABLE IF NOT EXISTS smart_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID NOT NULL REFERENCES candidates(id),
  suggested_position_ids UUID[],
  match_reason TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_positions_department_id ON positions(department_id);
CREATE INDEX idx_positions_hiring_manager_id ON positions(hiring_manager_id);
CREATE INDEX idx_positions_status ON positions(status);
CREATE INDEX idx_applications_candidate_id ON applications(candidate_id);
CREATE INDEX idx_applications_position_id ON applications(position_id);
CREATE INDEX idx_applications_status ON applications(status);
CREATE INDEX idx_candidates_status ON candidates(status);
