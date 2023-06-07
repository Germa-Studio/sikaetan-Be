const { dataPerson } = require('../models');
const ApiError = require('../../utils/ApiError');

const cekNik = async(req, res)=>{
    try {
      const {nik=""}= req.body
      const user = await dataPerson.findOne({ where: { nik, }, });
      if(!user) throw new ApiError(400, `data dengan nik ${nik} tidak ditemukan`)
      res.status(200).json({
          message: `data dengan nik ${nik} ditemukan`,
          user
      });
    } catch (error) {
      res.status(error.statusCode || 500).json({
      message: error.message,
    });
    }
}




module.exports = cekNik