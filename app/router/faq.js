const router = require("express").Router();
const auth = require("../../midleware/auth");
const {
  getFaqs,
  getDetailFaq,
  createFaq,
  updateFaq,
  deleteFaq,
} = require("../controllers/faq");

router.get("/", auth, getFaqs);
router.get("/:id", auth, getDetailFaq);
router.post("/", auth, createFaq);
router.patch("/:id", auth, updateFaq);
router.delete("/:id", auth, deleteFaq);
module.exports = router;
