const { kelompok, dataPerson, dataPenyuluh } = require('../models');

const selectTani = async(req, res)=>{
  try {
    const {kecamatan} =req.params
    const penyuluh = await dataPerson.findAll({ attributes: ['nama', 'kecamatan', 'role'], where:{kecamatan, role:"penyuluh"}});
    res.status(200).json({
      message: 'Berhasil Mendapatkan Data Info Tani',
      penyuluh
    });  
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: error.message,
    });
  }
} 



module.exports = {
    selectTani
    }