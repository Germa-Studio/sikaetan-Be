const router = require("express").Router();
const auth = require("../../midleware/auth");
const upload = require("../../midleware/uploader");
const {
  tambahDataTanaman,
  getAllDataTanaman,
  getDetailedDataTanaman,
  editDataTanaman,
  hapusDataTanaman,
  uploadDataTanaman,
} = require("../controllers/dataTanaman");

router.post("/", auth, tambahDataTanaman);
router.get("/", auth, getAllDataTanaman);
router.get("/:id", auth, getDetailedDataTanaman);
router.put("/:id", auth, editDataTanaman);
router.delete("/:id", auth, hapusDataTanaman);
router.post("/upload", auth, upload.single("file"), uploadDataTanaman);

module.exports = router;
