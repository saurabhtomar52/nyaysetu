const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

async function register(req, res, next) {
  try {
    const { name, email, password, role = 'citizen', district, specialization, experience, contact, barCouncilNumber } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: 'Name, email and password are required' });
    if (!['citizen', 'lawyer'].includes(role)) return res.status(400).json({ error: 'Invalid role' });

    const existing = await db.query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
    if (existing.rows.length) return res.status(409).json({ error: 'Email already registered' });

    const passwordHash = await bcrypt.hash(password, 10);
    const userResult = await db.query(
      'INSERT INTO users (name, email, password_hash, role) VALUES ($1,$2,$3,$4) RETURNING id,name,email,role',
      [name, email.toLowerCase(), passwordHash, role]
    );
    const user = userResult.rows[0];

    if (role === 'lawyer') {
      if (!district || !specialization || !barCouncilNumber) {
        await db.query('DELETE FROM users WHERE id=$1', [user.id]);
        return res.status(400).json({ error: 'District, specialization and Bar Council number are required' });
      }
      await db.query(
        `INSERT INTO lawyer_profiles (user_id,district,specialization,experience,contact,bar_council_number)
         VALUES ($1,$2,$3,$4,$5,$6)`,
        [user.id, district, Number(experience) || 0, contact || null, barCouncilNumber]
      );
    }
    res.status(201).json({ message: 'Registration successful', user });
  } catch (error) { next(error); }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });
    const result = await db.query('SELECT * FROM users WHERE email=$1', [email.toLowerCase()]);
    const user = result.rows[0];
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    const token = jwt.sign({ id: user.id, role: user.role, name: user.name }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '1d'
    });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (error) { next(error); }
}

module.exports = { register, login };
