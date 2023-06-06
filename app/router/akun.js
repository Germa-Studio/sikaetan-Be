const router = require('express').Router();
// const auth = require('../../midleware/auth');
const upload = require('../../midleware/uploader');
const {
  login,
  register,
} = require('../controllers/akun');

router.post('/login', login);
router.post('/register',upload.single('foto'), register);

module.exports = router;

