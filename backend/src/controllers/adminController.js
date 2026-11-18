const db = require('../config/db');

async function pending(req, res, next) {
  try {
    const result = await db.query(
      `SELECT lp.*,u.name,u.email FROM lawyer_profiles lp JOIN users u ON u.id=lp.user_id
       WHERE lp.verification_status='pending' ORDER BY lp.created_at DESC`
    );
    res.json(result.rows);
  } catch (error) { next(error); }
}

async function updateStatus(req, res, next) {
  try {
    const status = req.params.status;
    if (!['verified','rejected'].includes(status)) return res.status(400).json({ error: 'Invalid status' });
    const result = await db.query(
      `UPDATE lawyer_profiles SET verification_status=$1,updated_at=CURRENT_TIMESTAMP
       WHERE id=$2 RETURNING *`,
      [status, req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Lawyer profile not found' });
    res.json(result.rows[0]);
  } catch (error) { next(error); }
}

module.exports = { pending, updateStatus };
