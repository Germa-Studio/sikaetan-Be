const router = require("express").Router();
const auth = require("../../midleware/auth");
const upload = require("../../midleware/uploader");
const {
  getFooters,
  updateFooter,
  deleteFooter,
} = require("../controllers/footer");

router.get("/", auth, getFooters);
router.post("/", auth, upload.single("file"), updateFooter);
router.delete("/", auth, deleteFooter);
module.exports = router;
