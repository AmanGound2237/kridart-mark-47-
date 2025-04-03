const express = require('express');
const router = express.Router();
const assetController = require('../controllers/assetController');
const upload = require('../middleware/upload');
const auth = require('../middleware/auth');

router.post('/', auth, upload.single('file'), assetController.createAsset);
router.get('/', auth, assetController.getAssets);

module.exports = router;