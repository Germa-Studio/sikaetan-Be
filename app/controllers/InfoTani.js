const { tbl_akun: tblAkun } = require('../models');
const ApiError = require('../../utils/ApiError');
const imageKit = require('../../midleware/imageKit');

const infoTani = async(req, res)=>{
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
const tambahInfoTani = async(req, res)=>{
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
const eventTani = async(req, res)=>{
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
const tambahEventTani = async(req, res)=>{
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
        infoTani,
        tambahInfoTani,
        eventTani,
        tambahEventTani
    }