const router = require("express").Router();
const auth = require("../../midleware/auth");
const upload = require("../../midleware/uploader");
const {
  login,
  register,
  loginPetani,
  registerPetani,
  getUserNotVerify,
  verifikasi,
  getProfile,
  getDetailProfile,
  updateDetailProfile,
  getPeran,
  ubahPeran,
  opsiPenyuluh,
  opsiPoktan
  // verifikasiUser,
} = require("../controllers/akun");

router.post("/login", login);
router.post("/register", upload.single("foto"), register);
router.post("/petani-login", loginPetani);
router.post("/petani-register", upload.single("foto"), registerPetani);
router.get("/populate-penyuluh", opsiPenyuluh);
router.get("/populate-poktan", opsiPoktan);
router.get("/profile", getProfile);
router.get("/detailprofile", auth, getDetailProfile);
router.put("/updateprofile", auth, upload.single("foto"), updateDetailProfile)
router.get("/verify", getUserNotVerify);
router.get("/verify/:id", verifikasi);
router.get("/peran", auth, getPeran);
router.put("/peran/:id", auth, ubahPeran);
// router.put("/verify/:id", verifikasiUser)

module.exports = router;
