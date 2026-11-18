const db = require('../config/db');

async function list(req, res, next) {
  try {
    const result = await db.query(
      'SELECT * FROM legal_news ORDER BY published_at DESC, id DESC'
    );
    res.json(result.rows);
  } catch (error) { next(error); }
}

module.exports = { list };
