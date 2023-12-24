const router = require("express").Router();
const auth = require("../../midleware/auth");
const upload = require("../../midleware/uploader");

const {
  getAllTanamanPetani,
  getTanamanPetaniStatistically,
  // getTanamanPetaniById,
  // tambahTanamanPetani,
  // ubahTanamanPetaniById,
  // deleteTanamanPetaniById,
} = require("../controllers/tanamanPetani");

router.get("/list/", auth, getAllTanamanPetani);
router.get("/statistik/", getTanamanPetaniStatistically);

module.exports = router;
