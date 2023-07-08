const router = require('express').Router();
const auth = require('../../midleware/auth');
const upload = require('../../midleware/uploader');
const {
  laporanPetani,
  laporanPenyuluh,
  tambahDaftarTani,
  tambahLaporanTani,
  daftarTani,
  deleteDaftarTani
} = require('../controllers/dataTani');

router.post('/daftar-tani/add', auth, upload.single('foto') ,tambahDaftarTani);
router.post('/laporan-tani/add', auth, upload.single('fotoTanaman'), tambahLaporanTani);
router.get('/laporan-petani', auth, laporanPetani);
router.get('/laporan-penyuluh', auth, laporanPenyuluh);
router.get('/daftar-tani', auth, daftarTani);
router.delete('/daftar-tani/:id', auth, deleteDaftarTani);

module.exports = router;

