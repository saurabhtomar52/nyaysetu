const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const { pending, updateStatus } = require('../controllers/adminController');
const router = express.Router();
router.get('/lawyers/pending', authenticate, authorize('admin'), pending);
router.patch('/lawyers/:id/:status', authenticate, authorize('admin'), updateStatus);
module.exports = router;
