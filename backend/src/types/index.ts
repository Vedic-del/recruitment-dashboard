export interface Department {
  id: string;
  name: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface HiringManager {
  id: string;
  name: string;
  email?: string;
  departments: string[];
  created_at: string;
  updated_at: string;
}

export interface Position {
  id: string;
  title: string;
  department_id: string;
  hiring_manager_id: string;
  status: 'Open' | 'Closed' | 'Filled';
  requirements: {
    level?: string;
    skills?: string[];
    experience_years?: number;
  };
  generated_jd: string;
  created_at: string;
  closed_at?: string;
  updated_at: string;
}

export interface CandidateExtractedData {
  name: string;
  email: string;
  phone?: string;
  skills?: string[];
  experience?: string;
  location?: string;
  past_salary?: string;
  years_experience?: number;
  expected_salary?: string;
  notice_period?: string;
}

export interface Candidate {
  id: string;
  resume_file: string;
  resume_full_text: string;
  extracted_data: CandidateExtractedData;
  status: 'New' | 'Shortlisted' | 'Rejected' | 'Archived';
  created_at: string;
  updated_at: string;
}

export interface InterviewFeedback {
  round: number;
  technical_score?: number;
  communication_score?: number;
  culture_fit_score?: number;
  notes?: string;
  date?: string;
}

export interface TimeInStage {
  stage: string;
  entered_at: string;
  exited_at?: string;
}

export interface Application {
  id: string;
  candidate_id: string;
  position_id: string;
  status: 'Applied' | 'Screening' | 'Interview1' | 'Interview2' | 'Interview3' | 'Offer' | 'Hired' | 'Rejected';
  groq_score?: number;
  interview_feedback?: InterviewFeedback[];
  time_in_stage?: TimeInStage[];
  created_at: string;
  updated_at: string;
}

export interface SmartRecommendation {
  id: string;
  candidate_id: string;
  suggested_position_ids: string[];
  match_reason: string;
  created_at: string;
  updated_at: string;
}
