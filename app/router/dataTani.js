const router = require('express').Router();
const auth = require('../../midleware/auth');
const upload = require('../../midleware/uploader');
const {
  laporanPetani,
  laporanPenyuluh,
  tambahDaftarTani,
  tambahLaporanTani,
  daftarTani,
  deleteDaftarTani,
  dataTaniDetail,
  updateTaniDetail,
  getTanamanPetani,  
  tambahTanamanPetani,
  getTanamanPetaniById,
  ubahTanamanPetaniById,
  deleteTanamanPetaniById
} = require('../controllers/dataTani');

router.post('/daftar-tani/add', auth, upload.single('foto') ,tambahDaftarTani);
router.post('/laporan-tani/add', auth, upload.single('fotoTanaman'), tambahLaporanTani);
router.get('/laporan-petani', auth, laporanPetani);
router.get('/laporan-penyuluh', auth, laporanPenyuluh);
router.get('/daftar-tani', auth, daftarTani);
router.post('/tanaman-petani', auth, tambahTanamanPetani);

router.get('/tanaman-petani/detail/:id', auth, getTanamanPetaniById);
router.get('/tanaman-petani/:id', auth, getTanamanPetani);
router.put('/tanaman-petani/:id', auth, ubahTanamanPetaniById);
router.delete('/tanaman-petani/:id', auth, deleteTanamanPetaniById);
router.delete('/daftar-tani/:id', auth, deleteDaftarTani);
router.get('/daftar-tani/:id', auth, dataTaniDetail);
router.put('/daftar-tani/:id', auth, upload.single('foto') ,updateTaniDetail);

module.exports = router;

