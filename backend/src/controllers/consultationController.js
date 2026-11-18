const db = require('../config/db');

async function create(req, res, next) {
  try {
    const { lawyerId, subject, description, preferredDate } = req.body;
    if (!lawyerId || !subject || !description) return res.status(400).json({ error: 'Lawyer, subject and description are required' });
    const result = await db.query(
      `INSERT INTO consultation_requests (citizen_id,lawyer_id,subject,description,preferred_date)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [req.user.id, lawyerId, subject, description, preferredDate || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) { next(error); }
}

async function listMine(req, res, next) {
  try {
    const column = req.user.role === 'lawyer' ? 'cr.lawyer_id' : 'cr.citizen_id';
    const result = await db.query(
      `SELECT cr.*, cu.name AS citizen_name, lu.name AS lawyer_name
       FROM consultation_requests cr
       JOIN users cu ON cu.id=cr.citizen_id JOIN users lu ON lu.id=cr.lawyer_id
       WHERE ${column}=$1 ORDER BY cr.created_at DESC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (error) { next(error); }
}

module.exports = { create, listMine };
