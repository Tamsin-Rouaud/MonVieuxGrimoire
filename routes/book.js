const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

// Importer les fonctions correctement
const multer = require('../middleware/multer-config');

// Importe la logique métier de book
const bookCtrl = require('../controllers/book');

router.post('/', auth, multer, bookCtrl.createBook);
router.get('/', bookCtrl.getAllBooks);
router.get('/bestrating', bookCtrl.bestRatings);
router.get('/:id', bookCtrl.getOneBook);
router.post('/:id/rating', auth, bookCtrl.createRatingBook);
router.put('/:id', auth, multer, bookCtrl.modifyBook);
router.delete('/:id', auth, bookCtrl.deleteBook);

module.exports = router;


