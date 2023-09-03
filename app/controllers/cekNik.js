const { dataPerson, tanamanPetani, dataPenyuluh, kelompok } = require('../models');
const ApiError = require('../../utils/ApiError');

const cekNik = async(req, res)=>{
    try {
      console.log("sssssssss")
      const {NIK=""}= req.body
      const user = await dataPerson.findOne({ where: { NIK, }, });
      if(!user) throw new ApiError(400, `data dengan NIK ${NIK} tidak ditemukan`)
        const users = await dataPerson.findOne({ where: { NIK, }, include:[{model:tanamanPetani}, {model:kelompok}]});
        res.status(200).json({
            message: `data dengan NIK ${NIK} ditemukan`,
            users
        });
    } catch (error) {
      res.status(error.statusCode || 500).json({
      message: error.message,
    });
    }
}
const cekNiP = async(req, res)=>{
    try {
      const {NIP=""}= req.body
      const user = await dataPerson.findOne({ where: { NIP, }, });
      if(!user) throw new ApiError(400, `data dengan NIP ${NIP} tidak ditemukan`)
        const users = await dataPerson.findOne({ where: { NIP, }, include:[{model:dataPenyuluh}]});
        res.status(200).json({
            message: `data dengan NIP ${NIP} ditemukan`,
            users
        });
    } catch (error) {
      res.status(error.statusCode || 500).json({
      message: error.message,
    });
    }
}




module.exports = {cekNik, cekNiP}