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
  editKelompokById
} = require('../controllers/kelompok');

// router.get();
router.get('/kelompok', auth, getAllKelompok);
router.get('/kelompok/kecamatan', auth, getAllKecamatan);
router.get('/kelompok/desa', auth, getAllDesaInKecamatan);
router.get('/kelompok/:id', auth, getKelompokById);
router.put('/kelompok/:id', auth, editKelompokById);
router.delete('/kelompok/:id', auth, deleteKelompok);
router.post('/upload', auth, upload.single('file'), uploadDataKelompoks);

module.exports = router;
