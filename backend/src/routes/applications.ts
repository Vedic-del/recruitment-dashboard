import express, { Router } from 'express';
import { query } from '../config/database.js';
import { scoreCandidateMatch } from '../config/groq.js';

const router: Router = express.Router();

// Get all applications with filters
router.get('/', async (req, res) => {
  try {
    const { position_id, status, candidate_id } = req.query;

    let sql = `
      SELECT a.*,
             c.extracted_data,
             p.title as position_title,
             p.generated_jd
      FROM applications a
      JOIN candidates c ON a.candidate_id = c.id
      JOIN positions p ON a.position_id = p.id
      WHERE 1=1
    `;

    const params: any[] = [];
    let paramIndex = 1;

    if (position_id) {
      sql += ` AND a.position_id = $${paramIndex}`;
      params.push(position_id);
      paramIndex++;
    }

    if (status) {
      sql += ` AND a.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    if (candidate_id) {
      sql += ` AND a.candidate_id = $${paramIndex}`;
      params.push(candidate_id);
      paramIndex++;
    }

    sql += ` ORDER BY a.created_at DESC`;

    const result = await query(sql, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({ error: 'Failed to fetch applications' });
  }
});

// Get single application
router.get('/:id', async (req, res) => {
  try {
    const result = await query(
      `SELECT a.*, c.extracted_data, p.title as position_title, p.generated_jd
       FROM applications a
       JOIN candidates c ON a.candidate_id = c.id
       JOIN positions p ON a.position_id = p.id
       WHERE a.id = $1`,
      [req.params.id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Application not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching application:', error);
    res.status(500).json({ error: 'Failed to fetch application' });
  }
});

// Create application (candidate applied to position)
router.post('/', async (req, res) => {
  const { candidate_id, position_id } = req.body;

  if (!candidate_id || !position_id) {
    return res.status(400).json({ error: 'Candidate ID and position ID are required' });
  }

  try {
    // Check if application already exists
    const existingResult = await query(
      'SELECT id FROM applications WHERE candidate_id = $1 AND position_id = $2',
      [candidate_id, position_id]
    );

    if (existingResult.rowCount > 0) {
      return res.status(400).json({ error: 'Application already exists' });
    }

    // Get candidate and position data for scoring
    const candidateResult = await query('SELECT extracted_data FROM candidates WHERE id = $1', [candidate_id]);
    const positionResult = await query('SELECT generated_jd, title FROM positions WHERE id = $1', [position_id]);

    if (candidateResult.rowCount === 0 || positionResult.rowCount === 0) {
      return res.status(400).json({ error: 'Invalid candidate or position' });
    }

    // Score the candidate match
    const score = await scoreCandidateMatch(
      candidateResult.rows[0].extracted_data,
      positionResult.rows[0].generated_jd,
      positionResult.rows[0].title
    );

    // Create application
    const timeInStage = [
      {
        stage: 'Applied',
        entered_at: new Date().toISOString(),
      },
    ];

    const result = await query(
      `INSERT INTO applications (candidate_id, position_id, groq_score, time_in_stage)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [candidate_id, position_id, score, JSON.stringify(timeInStage)]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating application:', error);
    res.status(500).json({ error: 'Failed to create application' });
  }
});

// Move application to next stage
router.post('/:id/move-stage', async (req, res) => {
  const { new_status } = req.body;

  if (!new_status) {
    return res.status(400).json({ error: 'New status is required' });
  }

  try {
    // Get current application
    const currentResult = await query('SELECT * FROM applications WHERE id = $1', [req.params.id]);

    if (currentResult.rowCount === 0) {
      return res.status(404).json({ error: 'Application not found' });
    }

    const app = currentResult.rows[0];
    const timeInStage = app.time_in_stage || [];

    // Update time_in_stage
    if (timeInStage.length > 0) {
      timeInStage[timeInStage.length - 1].exited_at = new Date().toISOString();
    }

    timeInStage.push({
      stage: new_status,
      entered_at: new Date().toISOString(),
    });

    // Update application
    const result = await query(
      `UPDATE applications
       SET status = $1,
           time_in_stage = $2,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $3
       RETURNING *`,
      [new_status, JSON.stringify(timeInStage), req.params.id]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error moving application stage:', error);
    res.status(500).json({ error: 'Failed to move application stage' });
  }
});

// Add interview feedback
router.put('/:id/feedback', async (req, res) => {
  const { round, technical_score, communication_score, culture_fit_score, notes } = req.body;

  if (!round) {
    return res.status(400).json({ error: 'Interview round is required' });
  }

  try {
    // Get current application
    const currentResult = await query('SELECT * FROM applications WHERE id = $1', [req.params.id]);

    if (currentResult.rowCount === 0) {
      return res.status(404).json({ error: 'Application not found' });
    }

    const app = currentResult.rows[0];
    const feedback = app.interview_feedback || [];

    // Add new feedback
    feedback.push({
      round,
      technical_score,
      communication_score,
      culture_fit_score,
      notes,
      date: new Date().toISOString(),
    });

    // Update application
    const result = await query(
      `UPDATE applications
       SET interview_feedback = $1,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING *`,
      [JSON.stringify(feedback), req.params.id]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error adding interview feedback:', error);
    res.status(500).json({ error: 'Failed to add interview feedback' });
  }
});

export default router;
