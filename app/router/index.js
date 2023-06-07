const { Router, } = require('express');
const swaggerUI = require('swagger-ui-express');
const swaggerDocument = require('../../docs/swagger.json');
const akun = require('./akun');
const router = Router();
const cekNik = require("../controllers/cekNik")

router.use('/api-docs', swaggerUI.serve);
router.get('/api-docs', swaggerUI.setup(swaggerDocument));

router.get('/', (req, res) => {
  res.status(200).json({
    message: 'API is running',
  });
});
router.post('/cek-nik', cekNik);

router.use('/auth', akun);

module.exports = router;