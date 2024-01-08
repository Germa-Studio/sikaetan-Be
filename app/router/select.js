const router = require("express").Router();
const auth = require("../../midleware/auth");
const {
  selectTani,
  selectKelompok,
  selectKelompokById,
} = require("../controllers/select");

router.get("/kelompok-tani/desa/:desa", selectKelompok);
router.get("/kelompok-tani/:id", selectKelompokById);
router.get("/select-tani/:kecamatan", auth, selectTani);

module.exports = router;
