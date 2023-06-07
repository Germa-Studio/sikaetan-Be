const { tbl_akun: tblAkun } = require('../models');
const ApiError = require('../../utils/ApiError');
const imageKit = require('../../midleware/imageKit');

const laporanPetani = async(req, res)=>{
  try {
    res.status(200).json({
      message: '',
    });  
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: error.message,
    });
  }
}
const laporanPenyuluh = async(req, res)=>{
  try {
    res.status(200).json({
      message: '',
    });  
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: error.message,
    });
  }
}
const tambahDaftarTani = async(req, res)=>{
  try {
    res.status(200).json({
      message: '',
    });  
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: error.message,
    });
  }
}
const tambahLaporanTani = async(req, res)=>{
  try {
    res.status(200).json({
      message: '',
    });  
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: error.message,
    });
  }
}



module.exports = {
  laporanPetani,
  laporanPenyuluh,
  tambahDaftarTani,
  tambahLaporanTani
}