const express = require('express');
const { authenticate } = require('../middleware/auth');
const { send, conversation } = require('../controllers/messageController');
const router = express.Router();
router.post('/', authenticate, send);
router.get('/:userId', authenticate, conversation);
module.exports = router;
