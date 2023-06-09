const router = require('express').Router();
// const auth = require('../../midleware/auth');
const upload = require('../../midleware/uploader');
const {
  tambahDataPenyuluh,
  presensiKehadiran,
  jurnalKegiatan,
  RiwayatChat
} = require('../controllers/dataPenyuluh');

router.post('/penyuluh/add', upload.single('foto') ,tambahDataPenyuluh);
router.get('/presensi-kehadiran', presensiKehadiran);
router.get('/jurnal-kegiatan', jurnalKegiatan);
router.get('/riwayat-chat', RiwayatChat);

module.exports = router;