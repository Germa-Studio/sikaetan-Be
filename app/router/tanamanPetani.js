const router = require("express").Router();
const auth = require("../../midleware/auth");
const upload = require("../../midleware/uploader");

const {
  getAllTanamanPetani,
  getTanamanPetaniStatistically,
  getTanamanbyPetani,
  // getTanamanPetaniById,
  // tambahTanamanPetani,
  // ubahTanamanPetaniById,
  // deleteTanamanPetaniById,
} = require("../controllers/tanamanPetani");

router.get("/list/", auth, getAllTanamanPetani);
router.get("/statistik/", getTanamanPetaniStatistically);
router.get("/petani/:id", auth, getTanamanbyPetani);

module.exports = router;
