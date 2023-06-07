const router = require('express').Router();
// const auth = require('../../midleware/auth');
const upload = require('../../midleware/uploader');
const {
  infoTani,
  tambahInfoTani,
  eventTani,
  tambahEventTani
} = require('../controllers/InfoTani');

router.post('/event-tani/add', upload.single('foto') ,tambahEventTani);
router.post('/info-tani/add', tambahInfoTani);
router.get('/info-tani', infoTani);
router.get('/event-tani', eventTani);

module.exports = router;