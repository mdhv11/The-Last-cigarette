const express = require('express');
const journalController = require('../controllers/journalController');
const auth = require('../middleware/auth');

const router = express.Router();

router.post('/entry', auth, journalController.createEntry);
router.get('/entries', auth, journalController.getEntries);
router.delete('/entry/:id', auth, journalController.deleteEntry);

module.exports = router;
