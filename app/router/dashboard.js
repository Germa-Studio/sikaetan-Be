const router = require("express").Router();
const { getDashboardIndexData } = require("../controllers/dashboard");

router.get("/", getDashboardIndexData);
module.exports = router;
