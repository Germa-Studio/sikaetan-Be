const router = require('express').Router();
const auth = require('../../midleware/auth');
const {
  addChart,
  getChart
} = require('../controllers/chart');

router.post('/chart',auth, addChart);
router.get('/chart', getChart);


module.exports = router;

