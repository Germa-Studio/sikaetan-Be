const router = require('express').Router();
const auth = require('../../midleware/auth');
const upload = require('../../midleware/uploader');
const {
  uploadDataKelompoks,
  getAllKelompok,
} = require("../controllers/kelompok");

// router.get();
router.get('/daftar-kelompok', auth, getAllKelompok);
router.post('/upload', auth, upload.single("file"), uploadDataKelompoks);

module.exports = router;
