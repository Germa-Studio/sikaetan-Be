const router = require("express").Router();
const {
  getFooters,
  updateFooter,
  deleteFooter,
} = require("../controllers/footer");

router.get("/", getFooters);
router.patch("/", updateFooter);
router.delete("/", deleteFooter);
module.exports = router;
