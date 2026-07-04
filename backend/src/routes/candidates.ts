import express, { Router } from 'express';
import multer from 'multer';
import { query } from '../config/database.js';
import { parseResumeFile, saveUploadedFile } from '../services/resumeParserService.js';
import { findRecommendationsForCandidate, getRecommendedCandidates } from '../services/matchingService.js';

const router: Router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Get all candidates with filters
router.get('/', async (req, res) => {
  try {
    const { status } = req.query;

    let sql = 'SELECT * FROM candidates WHERE 1=1';
    const params: any[] = [];

    if (status) {
      sql += ' AND status = $1';
      params.push(status);
    }

    sql += ' ORDER BY created_at DESC';

    const result = await query(sql, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching candidates:', error);
    res.status(500).json({ error: 'Failed to fetch candidates' });
  }
});

// Get single candidate
router.get('/:id', async (req, res) => {
  try {
    const result = await query('SELECT * FROM candidates WHERE id = $1', [req.params.id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Candidate not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching candidate:', error);
    res.status(500).json({ error: 'Failed to fetch candidate' });
  }
});

// Get recommendations for candidate
router.get('/:id/recommendations', async (req, res) => {
  try {
    const recommendations = await getRecommendedCandidates(req.params.id);
    res.json(recommendations);
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    res.status(500).json({ error: 'Failed to fetch recommendations' });
  }
});

// Upload resume and create candidate
router.post('/upload', upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Resume file is required' });
    }

    // Save file
    const filePath = await saveUploadedFile(req.file);

    // Parse resume
    const extractedData = await parseResumeFile(filePath);

    // Get resume text (for storage)
    const resumeText = req.file.buffer.toString('utf-8', 0, Math.min(10000, req.file.buffer.length));

    // Create candidate record
    const result = await query(
      `INSERT INTO candidates (resume_file, resume_full_text, extracted_data)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [filePath, resumeText, JSON.stringify(extractedData)]
    );

    const candidateId = result.rows[0].id;

    // Find recommendations for this candidate
    await findRecommendationsForCandidate(candidateId);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error uploading resume:', error);
    res.status(500).json({ error: 'Failed to upload resume' });
  }
});

// Update candidate status
router.put('/:id', async (req, res) => {
  const { status, extracted_data } = req.body;

  try {
    const result = await query(
      `UPDATE candidates
       SET status = COALESCE($1, status),
           extracted_data = COALESCE($2, extracted_data),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $3
       RETURNING *`,
      [status, extracted_data ? JSON.stringify(extracted_data) : null, req.params.id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Candidate not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating candidate:', error);
    res.status(500).json({ error: 'Failed to update candidate' });
  }
});

// Delete candidate
router.delete('/:id', async (req, res) => {
  try {
    // Delete associated applications and recommendations
    await query('DELETE FROM applications WHERE candidate_id = $1', [req.params.id]);
    await query('DELETE FROM smart_recommendations WHERE candidate_id = $1', [req.params.id]);

    const result = await query('DELETE FROM candidates WHERE id = $1 RETURNING *', [req.params.id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Candidate not found' });
    }

    res.json({ message: 'Candidate deleted successfully' });
  } catch (error) {
    console.error('Error deleting candidate:', error);
    res.status(500).json({ error: 'Failed to delete candidate' });
  }
});

export default router;
