const jwt = require('jsonwebtoken');
const { tbl_akun: tblAkun, dataPerson  } = require('../app/models');
const dotenv = require('dotenv');
dotenv.config();
const auth = (req, res, next) => {
  try {
    const bearerToken = req.headers.authorization;
    // const token = bearerToken.split('Bearer')[1];
    if (!bearerToken) {
      return res.status(401).json({
        status: 'failed',
        message: 'Required authorization',
      });
    }
    const payload = jwt.verify(bearerToken, process.env.SECRET_KEY);
    if(payload.NIK){
      dataPerson.findByPk(payload.id).then((instance) => {
        req.user = instance;
        return next();
      });
    }else{
      tblAkun.findByPk(payload.id).then((instance) => {
        req.user = instance;
        return next();
      });
      next()
    }
  } catch {
    res.status(401).json({
      status: 'failed',
      message: 'Invalid token',
    });
  }
};
module.exports = auth;