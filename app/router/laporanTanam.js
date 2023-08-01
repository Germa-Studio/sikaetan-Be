const router = require('express').Router();
const auth = require('../../midleware/auth');
const upload = require('../../midleware/uploader');
const {
  tambahLaporanTanam,
  getAllLaporanTanam,
  getLaporanTanamById,
  editLaporanTanam,
  deleteLaporanTanam,
  tambahLaporanAkhir
} = require('../controllers/laporanTani');

router.post('/laporan-tanam', auth, upload.single('fotoTanaman') ,tambahLaporanTanam);
router.put('/laporan-tanam/:id', auth,upload.single('fotoTanaman'), editLaporanTanam);
router.delete('/laporan-tanam/:id', auth,   deleteLaporanTanam);
router.get('/laporan-tanam/:id', auth, getAllLaporanTanam);
router.get('/laporan-tanam/detail/:id', auth, getLaporanTanamById);
router.post('/laporan-akhir', auth, tambahLaporanAkhir);

module.exports = router;