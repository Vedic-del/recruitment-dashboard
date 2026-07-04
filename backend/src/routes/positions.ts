import express, { Router } from 'express';
import { query } from '../config/database.js';
import { generateJobDescription } from '../config/groq.js';

const router: Router = express.Router();

// Get all positions with filters
router.get('/', async (req, res) => {
  try {
    const { department_id, status, hiring_manager_id } = req.query;

    let sql = `
      SELECT p.*,
             d.name as department_name,
             hm.name as hiring_manager_name,
             COUNT(DISTINCT a.id) as total_candidates
      FROM positions p
      LEFT JOIN departments d ON p.department_id = d.id
      LEFT JOIN hiring_managers hm ON p.hiring_manager_id = hm.id
      LEFT JOIN applications a ON p.id = a.position_id
      WHERE 1=1
    `;

    const params: any[] = [];
    let paramIndex = 1;

    if (department_id) {
      sql += ` AND p.department_id = $${paramIndex}`;
      params.push(department_id);
      paramIndex++;
    }

    if (status) {
      sql += ` AND p.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    if (hiring_manager_id) {
      sql += ` AND p.hiring_manager_id = $${paramIndex}`;
      params.push(hiring_manager_id);
      paramIndex++;
    }

    sql += ` GROUP BY p.id, d.id, hm.id ORDER BY p.created_at DESC`;

    const result = await query(sql, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching positions:', error);
    res.status(500).json({ error: 'Failed to fetch positions' });
  }
});

// Get single position
router.get('/:id', async (req, res) => {
  try {
    const result = await query(
      `SELECT p.*, d.name as department_name, hm.name as hiring_manager_name
       FROM positions p
       LEFT JOIN departments d ON p.department_id = d.id
       LEFT JOIN hiring_managers hm ON p.hiring_manager_id = hm.id
       WHERE p.id = $1`,
      [req.params.id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Position not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching position:', error);
    res.status(500).json({ error: 'Failed to fetch position' });
  }
});

// Get candidates for a position
router.get('/:id/candidates', async (req, res) => {
  try {
    const result = await query(
      `SELECT c.*, a.id as application_id, a.status as application_status, a.groq_score
       FROM candidates c
       JOIN applications a ON c.id = a.candidate_id
       WHERE a.position_id = $1
       ORDER BY a.groq_score DESC NULLS LAST`,
      [req.params.id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching candidates:', error);
    res.status(500).json({ error: 'Failed to fetch candidates' });
  }
});

// Create position with auto-generated JD
router.post('/', async (req, res) => {
  const { title, department_id, hiring_manager_id, requirements } = req.body;

  if (!title || !department_id || !hiring_manager_id) {
    return res.status(400).json({ error: 'Title, department, and hiring manager are required' });
  }

  try {
    // Generate JD using Groq
    const skills = requirements?.skills || [];
    const level = requirements?.level || 'Mid-level';
    const department_name = (await query('SELECT name FROM departments WHERE id = $1', [department_id])).rows[0]?.name || 'Unknown';

    const generated_jd = await generateJobDescription(title, department_name, level, skills);

    const result = await query(
      `INSERT INTO positions (title, department_id, hiring_manager_id, requirements, generated_jd)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [title, department_id, hiring_manager_id, JSON.stringify(requirements || {}), generated_jd]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating position:', error);
    res.status(500).json({ error: 'Failed to create position' });
  }
});

// Update position
router.put('/:id', async (req, res) => {
  const { title, status, requirements } = req.body;

  try {
    const result = await query(
      `UPDATE positions
       SET title = COALESCE($1, title),
           status = COALESCE($2, status),
           requirements = COALESCE($3, requirements),
           closed_at = CASE WHEN $2 IN ('Closed', 'Filled') THEN CURRENT_TIMESTAMP ELSE closed_at END,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $4
       RETURNING *`,
      [title, status, requirements ? JSON.stringify(requirements) : null, req.params.id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Position not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating position:', error);
    res.status(500).json({ error: 'Failed to update position' });
  }
});

export default router;
