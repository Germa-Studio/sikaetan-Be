const router = require("express").Router();
const auth = require("../../midleware/auth");
const upload = require("../../midleware/uploader");

const {
  getAllTanamanPetani,
  getTanamanPetaniStatistically,
  getAllTanamanPetaniByPetani,
  getTanamanbyPetani,
  // getTanamanPetaniById,
  // tambahTanamanPetani,
  // ubahTanamanPetaniById,
  // deleteTanamanPetaniById,
} = require("../controllers/tanamanPetani");

router.get("/list/", auth, getAllTanamanPetani);
router.get("/statistik/", getTanamanPetaniStatistically);
router.get("/petani/:id", auth, getTanamanbyPetani);
router.get("/petani/:id/all", auth, getAllTanamanPetaniByPetani);

module.exports = router;
