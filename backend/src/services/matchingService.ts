import { query } from '../config/database.js';
import { findSimilarRoles } from '../config/groq.js';
import { Candidate, Position } from '../types/index.js';

export async function findRecommendationsForCandidate(
  candidateId: string
): Promise<string[]> {
  try {
    // Get candidate data
    const candidateResult = await query(
      'SELECT * FROM candidates WHERE id = $1',
      [candidateId]
    );

    if (candidateResult.rowCount === 0) {
      return [];
    }

    const candidate: Candidate = candidateResult.rows[0];

    // Get all open positions
    const positionsResult = await query(
      `SELECT p.* FROM positions p
       WHERE p.status = 'Open'
       AND NOT EXISTS (
         SELECT 1 FROM applications a
         WHERE a.candidate_id = $1 AND a.position_id = p.id
       )`,
      [candidateId]
    );

    const openPositions: Position[] = positionsResult.rows;

    if (openPositions.length === 0) {
      return [];
    }

    // Use Groq to find similar roles
    const recommendations = await findSimilarRoles(
      candidate.extracted_data,
      openPositions
    );

    // Store recommendations in database
    if (recommendations.length > 0) {
      const positionIds = openPositions
        .filter((p) => recommendations.includes(p.title))
        .map((p) => p.id);

      await query(
        `INSERT INTO smart_recommendations (candidate_id, suggested_position_ids, match_reason)
         VALUES ($1, $2, $3)
         ON CONFLICT (candidate_id) DO UPDATE SET
         suggested_position_ids = $2,
         updated_at = CURRENT_TIMESTAMP`,
        [
          candidateId,
          JSON.stringify(positionIds),
          'Auto-matched based on profile',
        ]
      );
    }

    return recommendations;
  } catch (error) {
    console.error('Error finding recommendations:', error);
    return [];
  }
}

export async function getRecommendedCandidates(
  positionId: string,
  limit: number = 5
): Promise<any[]> {
  try {
    const result = await query(
      `SELECT c.*, sr.match_reason
       FROM candidates c
       JOIN smart_recommendations sr ON c.id = sr.candidate_id
       WHERE sr.suggested_position_ids @> ARRAY[$1]::uuid[]
       AND c.status IN ('Archived', 'New')
       LIMIT $2`,
      [positionId, limit]
    );

    return result.rows;
  } catch (error) {
    console.error('Error getting recommended candidates:', error);
    return [];
  }
}
