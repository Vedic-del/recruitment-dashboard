import express, { Router } from 'express';
import { query } from '../config/database.js';
import { Department } from '../types/index.js';

const router: Router = express.Router();

// Get all departments
router.get('/', async (req, res) => {
  try {
    const result = await query('SELECT * FROM departments WHERE active = true ORDER BY name');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching departments:', error);
    res.status(500).json({ error: 'Failed to fetch departments' });
  }
});

// Get single department
router.get('/:id', async (req, res) => {
  try {
    const result = await query('SELECT * FROM departments WHERE id = $1', [req.params.id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Department not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching department:', error);
    res.status(500).json({ error: 'Failed to fetch department' });
  }
});

// Create department
router.post('/', async (req, res) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Department name is required' });
  }

  try {
    const result = await query(
      'INSERT INTO departments (name) VALUES ($1) RETURNING *',
      [name]
    );
    res.status(201).json(result.rows[0]);
  } catch (error: any) {
    if (error.code === '23505') {
      return res.status(400).json({ error: 'Department with this name already exists' });
    }
    console.error('Error creating department:', error);
    res.status(500).json({ error: 'Failed to create department' });
  }
});

// Update department
router.put('/:id', async (req, res) => {
  const { name, active } = req.body;

  try {
    const result = await query(
      'UPDATE departments SET name = COALESCE($1, name), active = COALESCE($2, active), updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *',
      [name, active, req.params.id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Department not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating department:', error);
    res.status(500).json({ error: 'Failed to update department' });
  }
});

// Soft delete department
router.delete('/:id', async (req, res) => {
  try {
    const result = await query(
      'UPDATE departments SET active = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *',
      [req.params.id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Department not found' });
    }

    res.json({ message: 'Department deleted successfully' });
  } catch (error) {
    console.error('Error deleting department:', error);
    res.status(500).json({ error: 'Failed to delete department' });
  }
});

export default router;
