const router = require('express').Router();
const auth = require('../../midleware/auth');
const upload = require('../../midleware/uploader');
const {
  infoTani,
  tambahInfoTani,
  eventTani,
  tambahEventTani,
  deleteInfoTani,
  deleteEventTani
} = require('../controllers/InfoTani');

router.post('/event-tani/add', auth, upload.single('fotoKegiatan') ,tambahEventTani);
router.post('/info-tani/add', auth,upload.single('fotoBerita'), tambahInfoTani);
router.get('/info-tani', auth, infoTani);
router.get('/event-tani', auth, eventTani);
router.delete('/info-tani/:id', auth, deleteInfoTani);
router.delete('/event-tani/:id', auth, deleteEventTani);

module.exports = router;