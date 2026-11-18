const db = require('../config/db');

async function send(req, res, next) {
  try {
    const { receiverId, content } = req.body;
    if (!receiverId || !content) return res.status(400).json({ error: 'Receiver and message are required' });
    const result = await db.query(
      'INSERT INTO messages (sender_id,receiver_id,content) VALUES ($1,$2,$3) RETURNING *',
      [req.user.id, receiverId, content]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) { next(error); }
}

async function conversation(req, res, next) {
  try {
    const otherId = req.params.userId;
    const result = await db.query(
      `SELECT m.*, su.name AS sender_name
       FROM messages m JOIN users su ON su.id=m.sender_id
       WHERE (sender_id=$1 AND receiver_id=$2) OR (sender_id=$2 AND receiver_id=$1)
       ORDER BY m.created_at ASC`,
      [req.user.id, otherId]
    );
    res.json(result.rows);
  } catch (error) { next(error); }
}

module.exports = { send, conversation };
