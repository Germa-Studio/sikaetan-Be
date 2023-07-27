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
  presensiKehadiranWeb
} = require('../controllers/dataPenyuluh');

router.post('/penyuluh/add', upload.single('foto') ,tambahDataPenyuluh);
router.post('/presensi-kehadiran/add',upload.single('FotoKegiatan'), tambahPresensiKehadiran);
router.post('/jurnal-kegiatan/add',upload.single('gambar'), tambahJurnalKegiatan);
router.get('/presensi-kehadiran', presensiKehadiran);
router.get('/presensi-kehadiran/web', presensiKehadiranWeb);
router.get('/jurnal-kegiatan', jurnalKegiatan);
router.get('/riwayat-chat', RiwayatChat);
router.get('/daftar-penyuluh', auth, daftarPenyuluh);
router.delete('/daftar-penyuluh/:id', auth, deleteDaftarPenyuluh);

module.exports = router;