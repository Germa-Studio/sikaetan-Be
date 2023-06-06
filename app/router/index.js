const { Router, } = require('express');
const swaggerUI = require('swagger-ui-express');
const swaggerDocument = require('../../docs/swagger.json');

const router = Router();

router.use('/api-docs', swaggerUI.serve);
router.get('/api-docs', swaggerUI.setup(swaggerDocument));

router.get('/', (req, res) => {
  res.status(200).json({
    message: 'API is running',
  });
});



module.exports = router;