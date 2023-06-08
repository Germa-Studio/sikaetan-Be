const router = require('express').Router();
const auth = require('../../midleware/auth');
const upload = require('../../midleware/uploader');
const {
  infoTani,
  tambahInfoTani,
  eventTani,
  tambahEventTani
} = require('../controllers/InfoTani');

router.post('/event-tani/add', auth, upload.single('fotoKegiatan') ,tambahEventTani);
router.post('/info-tani/add', auth,upload.single('fotoBerita'), tambahInfoTani);
router.get('/info-tani', auth, infoTani);
router.get('/event-tani', auth, eventTani);

module.exports = router;