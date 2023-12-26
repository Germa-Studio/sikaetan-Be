const router = require("express").Router();
const auth = require("../../midleware/auth");
const upload = require("../../midleware/uploader");
const {
  usersAll,
  searchPoktan,
  searchPetani,
} = require("../controllers/users");

router.get("/users", auth, usersAll);
router.get("/search/poktan", searchPoktan);
router.get("/search/petani", searchPetani);

module.exports = router;
