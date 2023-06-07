const router = require('express').Router();
// const auth = require('../../midleware/auth');
const upload = require('../../midleware/uploader');
const {
  tambahDaftarPenjual,
  productPetani,
  productPenyuluh,
} = require('../controllers/tokoTani');

router.post('/event-tani/add', upload.single('foto') ,tambahEventTani);
router.post('/info-tani/add', tambahInfoTani);
router.get('/info-tani', infoTani);
router.get('/event-tani', eventTani);

module.exports = router;