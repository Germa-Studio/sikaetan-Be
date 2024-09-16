const router = require('express').Router();
const auth = require('../../midleware/auth');
const upload = require('../../midleware/uploader');
const {
  uploadDataKelompoks,
  getAllKelompok,
  getAllKecamatan,
  getAllDesaInKecamatan,
  deleteKelompok,
  getKelompokById,
  editKelompokById,
  changeKecamatanToId,
  changeDesaToId
} = require('../controllers/kelompok');

// router.get();
router.get('/', auth, getAllKelompok);
router.get('/kecamatan', auth, getAllKecamatan);
router.get('/desa', auth, getAllDesaInKecamatan);
router.get('/:id', auth, getKelompokById);
router.put('/:id', auth, editKelompokById);
router.delete('/:id', auth, deleteKelompok);
router.put('/fix/kecamatan', auth, changeKecamatanToId);
router.put('/fix/desa', auth, changeDesaToId);
router.post('/upload', auth, upload.single('file'), uploadDataKelompoks);

module.exports = router;
