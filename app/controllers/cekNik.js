const { dataPerson, tanamanPetani, laporanTanam, kelompok } = require('../models');
const ApiError = require('../../utils/ApiError');

const cekNik = async(req, res)=>{
    try {
      const {nik=""}= req.body
      const user = await dataPerson.findOne({ where: { nik, }, });
      if(!user) throw new ApiError(400, `data dengan nik ${nik} tidak ditemukan`)
        const users = await dataPerson.findOne({ where: { nik, }, include:[{model:tanamanPetani}, {model:laporanTanam}, {model:kelompok}]});
        res.status(200).json({
            message: `data dengan nik ${nik} ditemukan`,
            users
        });
    } catch (error) {
      res.status(error.statusCode || 500).json({
      message: error.message,
    });
    }
}




module.exports = cekNik