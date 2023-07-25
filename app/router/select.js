const router = require('express').Router();
const auth = require('../../midleware/auth');
const {
  selectTani,
  selectKelompok
} = require('../controllers/select');


router.get('/kelompok-tani/:desa', selectKelompok);
router.get('/select-tani/:kecamatan', auth, selectTani);

module.exports = router;