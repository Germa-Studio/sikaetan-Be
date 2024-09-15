const router = require('express').Router();
const upload = require('../../midleware/uploader');
const { getKecamatan, getDesaByKecamatan, addWilayah } = require('../controllers/wilayah');

router.get('/kecamatan', getKecamatan);
router.get('/desa', getDesaByKecamatan);
router.post('/add', upload.single('file'), addWilayah);

module.exports = router;
