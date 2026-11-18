const db = require('../config/db');

async function search(req, res, next) {
  try {
    const { district, specialization } = req.query;
    const values = [];
    const clauses = ["lp.verification_status='verified'"];
    if (district) { values.push(`%${district}%`); clauses.push(`lp.district ILIKE $${values.length}`); }
    if (specialization) { values.push(`%${specialization}%`); clauses.push(`lp.specialization ILIKE $${values.length}`); }
    const result = await db.query(
      `SELECT lp.id,u.name,u.email,lp.district,lp.specialization,lp.experience,lp.contact,lp.verification_status
       FROM lawyer_profiles lp JOIN users u ON u.id=lp.user_id
       WHERE ${clauses.join(' AND ')} ORDER BY lp.created_at DESC`,
      values
    );
    res.json(result.rows);
  } catch (error) { next(error); }
}

async function getById(req, res, next) {
  try {
    const result = await db.query(
      `SELECT lp.id,u.id AS user_id,u.name,u.email,lp.district,lp.specialization,lp.experience,lp.contact,
              lp.bar_council_number,lp.verification_status
       FROM lawyer_profiles lp JOIN users u ON u.id=lp.user_id WHERE lp.id=$1`,
      [req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Lawyer not found' });
    res.json(result.rows[0]);
  } catch (error) { next(error); }
}

module.exports = { search, getById };
