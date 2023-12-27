const router = require("express").Router();
const auth = require("../../midleware/auth");
const upload = require("../../midleware/uploader");
const {
  laporanPetani,
  laporanPenyuluh,
  tambahDaftarTani,
  tambahLaporanTani,
  daftarTani,
  deleteDaftarTani,
  dataTaniDetail,
  updateTaniDetail,
  getTanamanPetani,
  getLaporanPetani,
  tambahTanamanPetani,
  getTanamanPetaniById,
  ubahTanamanPetaniById,
  deleteTanamanPetaniById,
} = require("../controllers/dataTani");
const {
  getAllDataTanaman,
} = require("../controllers/dataTanaman")

router.post("/daftar-tani/add", auth, upload.single("foto"), tambahDaftarTani);
router.post(
  "/laporan-tani/add",
  auth,
  upload.single("fotoTanaman"),
  tambahLaporanTani
);
router.get("/laporan-petani", auth, laporanPetani);
router.get("/laporan-penyuluh", auth, laporanPenyuluh);
router.get("/daftar-tani", auth, daftarTani);
router.post("/tanaman-petani", auth, tambahTanamanPetani);

router.get("/tanaman-petani/detail/:id", auth, getTanamanPetaniById);
router.get("/statistik/", auth, getAllDataTanaman);
router.get("/tanaman-petani/:id", auth, getLaporanPetani);
router.put("/tanaman-petani/:id", auth, ubahTanamanPetaniById);
router.delete("/tanaman-petani/:id", auth, deleteTanamanPetaniById);
router.delete("/daftar-tani/:id", auth, deleteDaftarTani);
router.get("/daftar-tani/:id", auth, dataTaniDetail);
router.put("/daftar-tani/:id", auth, upload.single("foto"), updateTaniDetail);
const {
  getAllTanamanPetani,
  // getTanamanPetaniById,
  tambahDataTanamanPetani,
  // ubahTanamanPetaniById,
  getDetailedDataTanamanPetani,
  deleteDatatanamanPetani,
  editDataTanamanPetani,
  // deleteTanamanPetaniById,
  } = require("../controllers/tanamanPetani");

router.get("/list-tanaman", auth, getAllTanamanPetani);
router.put("/list-tanaman/:id", auth, editDataTanamanPetani);
router.get("/list-tanaman/:id", auth, getDetailedDataTanamanPetani);
router.post("/list-tanaman", auth, tambahDataTanamanPetani);
router.delete("/list-tanaman/:id", auth, deleteDatatanamanPetani);

module.exports = router;
