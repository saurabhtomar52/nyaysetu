const express = require('express');
const { search, getById } = require('../controllers/lawyerController');
const router = express.Router();
router.get('/', search);
router.get('/:id', getById);
module.exports = router;
