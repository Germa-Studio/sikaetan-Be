const {
	getActivity,
	getTrashActivity,
	postActivity,
	deleteActivity,
	restoreActivity,
} = require("../controllers/logActivity");

const router = require("express").Router();

router.get("/log-activity", getActivity);
router.get("/trash-activity", getTrashActivity);
router.post("/log-activity", postActivity);
router.delete("/trash-activity/:id", deleteActivity);
router.patch("/trash-activity-restore/:id", restoreActivity);

module.exports = router;
