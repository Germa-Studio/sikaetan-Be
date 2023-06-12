const { kelompok, dataPerson, dataPenyuluh } = require('../models');

const selectTani = async(req, res)=>{
  try {
    const {desa} =req.query
    const data = await kelompok.findAll({where:{desa}});
    // const penyuluh = await dataPenyuluh.findAll({where:{desa}, include:[{model:dataPerson}]});
    const penyuluh = await dataPerson.findAll({where:{desa, role:"penyuluh"}});
    res.status(200).json({
      message: 'Berhasil Mendapatkan Data Info Tani',
      kelompok:data,
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