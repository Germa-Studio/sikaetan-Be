const router = require('express').Router();
// const auth = require('../../midleware/auth');
const upload = require('../../midleware/uploader');
const {
  laporanPetani,
  laporanPenyuluh,
  tambahDaftarTani,
  tambahLaporanTani
} = require('../controllers/dataTani');

router.post('/daftar-tani/add', upload.single('foto') ,tambahDaftarTani);
router.post('/laporan-tani/add', tambahLaporanTani);
router.get('/laporan-petani', laporanPetani);
router.get('/laporan-penyuluh', laporanPenyuluh);

module.exports = router;

