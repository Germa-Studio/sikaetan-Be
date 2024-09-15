const router = require('express').Router();
const auth = require('../../midleware/auth');

const {
  getAllTanamanPetani,
  getTanamanPetaniStatistically,
  getAllTanamanPetaniByPetani,
  getTanamanbyPetani,
  getTopTanamanPetani,
  getAllTanamanPetaniByPenyuluh
  // getTanamanPetaniById,
  // tambahTanamanPetani,
  // ubahTanamanPetaniById,
  // deleteTanamanPetaniById,
} = require('../controllers/tanamanPetani');

router.get('/', getTopTanamanPetani);
router.get('/list/', auth, getAllTanamanPetani);
router.get('/statistik/', getTanamanPetaniStatistically);
router.get('/petani/:id', auth, getTanamanbyPetani);
router.get('/petani/:id/all', auth, getAllTanamanPetaniByPetani);
router.get('/penyuluh/all', auth, getAllTanamanPetaniByPenyuluh);

module.exports = router;
