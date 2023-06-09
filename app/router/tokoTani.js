const router = require('express').Router();
const auth = require('../../midleware/auth');
const upload = require('../../midleware/uploader');
const {
  tambahDaftarPenjual,
  productPetani,
  productPenyuluh,
} = require('../controllers/tokoTani');

router.post('/daftar-penjual/add', upload.single('fotoTanaman') ,tambahDaftarPenjual);
router.get('/product-penyuluh', productPenyuluh);
router.get('/product-petani', productPetani);

module.exports = router;