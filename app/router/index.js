const { Router, } = require('express');
const swaggerUI = require('swagger-ui-express');
const swaggerDocument = require('../../docs/swagger.json');
const router = Router();
const cekNik = require("../controllers/cekNik")
const akun = require('./akun');
const auth = require('../../midleware/auth');
const dataTani = require('./dataTani');
const InfoTani = require('./InfoTani');

router.use('/api-docs', swaggerUI.serve);
router.get('/api-docs', swaggerUI.setup(swaggerDocument));

router.get('/', auth, (req, res) => {
  res.status(200).json({
    message: 'API is running',
  });
});
router.post('/cek-nik', cekNik);

router.use('/auth', akun);
router.use('/', dataTani);
router.use('/', InfoTani);

module.exports = router;