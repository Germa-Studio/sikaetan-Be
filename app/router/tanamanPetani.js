const router = require("express").Router();
const auth = require("../../midleware/auth");
const upload = require("../../midleware/uploader");

// const {
//     getAllTanamanPetani,
//     // getTanamanPetaniById,
//     // tambahTanamanPetani,
//     // ubahTanamanPetaniById,
//     // deleteTanamanPetaniById,
//     } = require("../controllers/tanamanPetani");

// router.get("/list-tanaman", auth, getAllTanamanPetani);

module.exports = router;
