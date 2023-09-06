const { kelompok, dataPerson, dataPenyuluh } = require('../models');
const { Op } = require('sequelize');

const selectTani = async(req, res)=>{
  try {
    const {kecamatan} =req.params
const penyuluh = await dataPerson.findAll({
  attributes: ['nama'],
  include: {
    model: dataPenyuluh,
    attributes: ['kecamatanBinaan']
  },
  where: {
    '$dataPenyuluh.kecamatanBinaan$': kecamatan
  }
});
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
const selectKelompok = async(req, res)=>{
  try {
    const {desa} =req.params
    const kelompokTani = await kelompok.findAll({where:{desa}});
    res.status(200).json({
      message: 'Berhasil Mendapatkan Data Info Tani',
      kelompokTani
    });  
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: error.message,
    });
  }
} 



module.exports = {
    selectTani,
    selectKelompok
    }