const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const lawyerRoutes = require('./routes/lawyers');
const consultationRoutes = require('./routes/consultations');
const messageRoutes = require('./routes/messages');
const newsRoutes = require('./routes/news');
const adminRoutes = require('./routes/admin');
const errorHandler = require('./middleware/errorHandler');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
app.use('/api/auth', authRoutes);
app.use('/api/lawyers', lawyerRoutes);
app.use('/api/consultations', consultationRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/admin', adminRoutes);
app.use(errorHandler);

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`NyaySetu API running on port ${port}`));
