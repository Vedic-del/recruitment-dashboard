import express, { Router } from 'express';
import { query } from '../config/database.js';

const router: Router = express.Router();

// Get all hiring managers
router.get('/', async (req, res) => {
  try {
    const result = await query('SELECT * FROM hiring_managers ORDER BY name');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching hiring managers:', error);
    res.status(500).json({ error: 'Failed to fetch hiring managers' });
  }
});

// Get hiring managers by department
router.get('/department/:deptId', async (req, res) => {
  try {
    const result = await query(
      'SELECT * FROM hiring_managers WHERE $1 = ANY(departments) ORDER BY name',
      [req.params.deptId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching hiring managers:', error);
    res.status(500).json({ error: 'Failed to fetch hiring managers' });
  }
});

// Get single hiring manager
router.get('/:id', async (req, res) => {
  try {
    const result = await query('SELECT * FROM hiring_managers WHERE id = $1', [req.params.id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Hiring manager not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching hiring manager:', error);
    res.status(500).json({ error: 'Failed to fetch hiring manager' });
  }
});

// Create hiring manager
router.post('/', async (req, res) => {
  const { name, email, departments } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Name is required' });
  }

  try {
    const result = await query(
      'INSERT INTO hiring_managers (name, email, departments) VALUES ($1, $2, $3) RETURNING *',
      [name, email || null, departments || []]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating hiring manager:', error);
    res.status(500).json({ error: 'Failed to create hiring manager' });
  }
});

// Update hiring manager
router.put('/:id', async (req, res) => {
  const { name, email, departments } = req.body;

  try {
    const result = await query(
      `UPDATE hiring_managers
       SET name = COALESCE($1, name),
           email = COALESCE($2, email),
           departments = COALESCE($3, departments),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $4
       RETURNING *`,
      [name, email, departments, req.params.id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Hiring manager not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating hiring manager:', error);
    res.status(500).json({ error: 'Failed to update hiring manager' });
  }
});

// Delete hiring manager
router.delete('/:id', async (req, res) => {
  try {
    const result = await query(
      'DELETE FROM hiring_managers WHERE id = $1 RETURNING *',
      [req.params.id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Hiring manager not found' });
    }

    res.json({ message: 'Hiring manager deleted successfully' });
  } catch (error) {
    console.error('Error deleting hiring manager:', error);
    res.status(500).json({ error: 'Failed to delete hiring manager' });
  }
});

export default router;
