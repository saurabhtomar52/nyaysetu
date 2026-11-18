const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const { create, listMine } = require('../controllers/consultationController');
const router = express.Router();
router.post('/', authenticate, authorize('citizen'), create);
router.get('/mine', authenticate, listMine);
module.exports = router;
