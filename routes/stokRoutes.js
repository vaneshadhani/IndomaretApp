const express = require('express');
const router = express.Router();
const stokController = require('../controllers/stokController');

router.get('/laporan-stok', stokController.getLaporanStok);

router.post('/update-quantity', stokController.updateQuantity);

module.exports = router;
