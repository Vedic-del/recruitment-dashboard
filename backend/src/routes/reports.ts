import express, { Router } from 'express';
import { query } from '../config/database.js';

const router: Router = express.Router();

// Get pipeline health report
router.get('/pipeline', async (req, res) => {
  try {
    const result = await query(`
      SELECT
        p.id,
        p.title,
        d.name as department,
        hm.name as hiring_manager,
        p.status as position_status,
        COALESCE(a.status, 'No Applications') as application_status,
        COUNT(a.id) as count,
        p.created_at,
        p.closed_at
      FROM positions p
      LEFT JOIN departments d ON p.department_id = d.id
      LEFT JOIN hiring_managers hm ON p.hiring_manager_id = hm.id
      LEFT JOIN applications a ON p.id = a.position_id
      GROUP BY p.id, d.id, hm.id, a.status
      ORDER BY p.created_at DESC
    `);

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching pipeline report:', error);
    res.status(500).json({ error: 'Failed to fetch pipeline report' });
  }
});

// Get time-to-fill report
router.get('/time-to-fill', async (req, res) => {
  try {
    const result = await query(`
      SELECT
        p.id,
        p.title,
        d.name as department,
        p.created_at,
        p.closed_at,
        EXTRACT(DAY FROM p.closed_at - p.created_at) as days_to_fill,
        COUNT(DISTINCT a.id) as total_applications,
        COUNT(DISTINCT CASE WHEN a.status = 'Hired' THEN a.id END) as hired_candidates
      FROM positions p
      LEFT JOIN departments d ON p.department_id = d.id
      LEFT JOIN applications a ON p.id = a.position_id
      WHERE p.status IN ('Closed', 'Filled')
      GROUP BY p.id, d.id
      ORDER BY p.closed_at DESC
    `);

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching time-to-fill report:', error);
    res.status(500).json({ error: 'Failed to fetch time-to-fill report' });
  }
});

// Get department report
router.get('/department/:deptId', async (req, res) => {
  try {
    const result = await query(`
      SELECT
        d.id,
        d.name as department,
        COUNT(DISTINCT p.id) as open_positions,
        COUNT(DISTINCT CASE WHEN p.status = 'Filled' THEN p.id END) as filled_positions,
        COUNT(DISTINCT a.id) as total_applications,
        COUNT(DISTINCT CASE WHEN a.status = 'Hired' THEN a.id END) as hired_count
      FROM departments d
      LEFT JOIN positions p ON d.id = p.department_id
      LEFT JOIN applications a ON p.id = a.position_id
      WHERE d.id = $1
      GROUP BY d.id
    `, [req.params.deptId]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Department not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching department report:', error);
    res.status(500).json({ error: 'Failed to fetch department report' });
  }
});

// Get hiring manager report
router.get('/hiring-manager/:hmId', async (req, res) => {
  try {
    const result = await query(`
      SELECT
        hm.id,
        hm.name as hiring_manager,
        COUNT(DISTINCT p.id) as open_positions,
        COUNT(DISTINCT CASE WHEN p.status = 'Filled' THEN p.id END) as filled_positions,
        COUNT(DISTINCT a.id) as total_applications,
        COUNT(DISTINCT CASE WHEN a.status = 'Hired' THEN a.id END) as hired_count,
        ROUND(AVG(a.groq_score)) as avg_candidate_score
      FROM hiring_managers hm
      LEFT JOIN positions p ON hm.id = p.hiring_manager_id
      LEFT JOIN applications a ON p.id = a.position_id
      WHERE hm.id = $1
      GROUP BY hm.id
    `, [req.params.hmId]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Hiring manager not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching hiring manager report:', error);
    res.status(500).json({ error: 'Failed to fetch hiring manager report' });
  }
});

// Get dashboard summary
router.get('/dashboard/summary', async (req, res) => {
  try {
    const result = await query(`
      SELECT
        COUNT(DISTINCT p.id) as total_positions,
        COUNT(DISTINCT CASE WHEN p.status = 'Open' THEN p.id END) as open_positions,
        COUNT(DISTINCT CASE WHEN p.status = 'Filled' THEN p.id END) as filled_positions,
        COUNT(DISTINCT a.id) as total_applications,
        COUNT(DISTINCT CASE WHEN a.status = 'Hired' THEN a.id END) as total_hired,
        COUNT(DISTINCT d.id) as total_departments,
        ROUND(AVG(a.groq_score)) as avg_candidate_score
      FROM positions p
      LEFT JOIN departments d ON p.department_id = d.id
      LEFT JOIN applications a ON p.id = a.position_id
    `);

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching dashboard summary:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard summary' });
  }
});

export default router;
