const router = require('express').Router();
const auth = require('../../midleware/auth');
const {
  selectTani
} = require('../controllers/select');


router.get('/select-tani', auth, selectTani);

module.exports = router;