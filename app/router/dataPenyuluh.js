const router = require('express').Router();
const auth = require('../../midleware/auth');
const upload = require('../../midleware/uploader');
const {
  tambahDataPenyuluh,
  presensiKehadiran,
  jurnalKegiatan,
  RiwayatChat,
  tambahJurnalKegiatan,
  tambahPresensiKehadiran,
  daftarPenyuluh,
  deleteDaftarPenyuluh,
  presensiKehadiranWeb,
  daftarPenyuluhById,
  updatePenyuluh,
  uploadDataPenyuluh,
  opsiPenyuluh,
  jurnalKegiatanbyId,
  deleteJurnalKegiatan,
  updateJurnalKegiatan,
  getKelompok
} = require('../controllers/dataPenyuluh');

router.post('/penyuluh/add', auth, upload.single('foto') ,tambahDataPenyuluh);
router.post('/presensi-kehadiran/add', auth, upload.single('FotoKegiatan'), tambahPresensiKehadiran);
router.post('/jurnal-kegiatan/add', auth, upload.single('gambar'), tambahJurnalKegiatan);
router.get('/presensi-kehadiran', auth, presensiKehadiran);
router.get('/presensi-kehadiran/web', auth, presensiKehadiranWeb);
router.get('/jurnal-kegiatan', auth, jurnalKegiatan);
router.get('/jurnal-kegiatan/:id', auth, jurnalKegiatanbyId);
router.put('/jurnal-kegiatan/:id', auth, upload.single('gambar'), updateJurnalKegiatan);
router.delete('/jurnal-kegiatan/:id', auth, deleteJurnalKegiatan);
router.get('/riwayat-chat', auth, RiwayatChat);
router.get('/daftar-penyuluh', auth, daftarPenyuluh);
router.get('/daftar-penyuluh/:id', auth, daftarPenyuluhById);
router.put('/daftar-penyuluh/:id', auth, upload.single('foto') ,updatePenyuluh);
router.delete('/daftar-penyuluh/:id', auth, deleteDaftarPenyuluh);
router.post('/upload-data-penyuluh',auth, upload.single("file"), uploadDataPenyuluh)
router.get('/opsi-penyuluh', auth, opsiPenyuluh);
router.get('/kelompok', auth, getKelompok);
module.exports = router;