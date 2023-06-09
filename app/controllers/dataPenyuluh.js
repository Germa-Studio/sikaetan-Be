const { tbl_akun: tblAkun } = require('../models');
const ApiError = require('../../utils/ApiError');
const imageKit = require('../../midleware/imageKit');

const tambahDataPenyuluh = async(req, res)=>{
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
const presensiKehadiran = async(req, res)=>{
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
const jurnalKegiatan = async(req, res)=>{
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
const RiwayatChat = async(req, res)=>{
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
  tambahDataPenyuluh,
  presensiKehadiran,
  jurnalKegiatan,
  RiwayatChat
}