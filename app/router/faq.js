const router = require("express").Router();
const {
  getFaqs,
  getDetailFaq,
  createFaq,
  updateFaq,
  deleteFaq,
} = require("../controllers/faq");

router.get("/", getFaqs);
router.get("/:id", getDetailFaq);
router.post("/", createFaq);
router.patch("/:id", updateFaq);
router.delete("/:id", deleteFaq);
module.exports = router;
