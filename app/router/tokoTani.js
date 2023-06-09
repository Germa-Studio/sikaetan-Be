const router = require('express').Router();
const auth = require('../../midleware/auth');
const upload = require('../../midleware/uploader');
const {
  tambahDaftarPenjual,
  productPetani,
  productPenyuluh,
} = require('../controllers/tokoTani');

router.post('/daftar-penjual/add', auth, upload.single('fotoTanaman') ,tambahDaftarPenjual);
router.get('/product-penyuluh', auth, productPenyuluh);
router.get('/product-petani', auth, productPetani);

module.exports = router;