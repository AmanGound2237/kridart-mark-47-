const express = require('express');
const router = express.Router();
const gameController = require('../controllers/gameController');
const auth = require('../middleware/auth');

router.post('/', auth, gameController.createGame);
router.put('/:id', auth, gameController.updateGame);
router.put('/:id/publish', auth, gameController.publishGame);
router.get('/my-games', auth, gameController.getUserGames);

module.exports = router;