// Protect every notes route with the signed-in user's authentication.
const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const { getNotes, createNote, updateNote, deleteNote } = require('../controllers/notesController');

const router = express.Router();

router.use(authMiddleware);

router.get('/', getNotes);
router.post('/', createNote);
router.put('/:id', updateNote);
router.delete('/:id', deleteNote);

module.exports = router;
