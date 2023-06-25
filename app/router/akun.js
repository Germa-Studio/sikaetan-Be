const router = require('express').Router();
// const auth = require('../../midleware/auth');
const upload = require('../../midleware/uploader');
const {
  login,
  register,
  loginPetani,
  registerPetani,
} = require('../controllers/akun');

router.post('/login', login);
router.post('/register',upload.single('foto'), register);
router.post('/petani-login', loginPetani);
router.post('/petani-register',upload.single('foto'), registerPetani);


module.exports = router;

