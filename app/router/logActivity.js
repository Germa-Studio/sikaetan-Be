const { getActivity, postActivity } = require("../controllers/logActivity");

const router = require("express").Router();

router.get("/log-activity", getActivity);
router.post("/log-activity", postActivity);

module.exports = router;
