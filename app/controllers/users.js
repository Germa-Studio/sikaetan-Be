const { dataPerson } = require('../models');
const { Op } = require('sequelize');

const usersAll = async(req, res)=>{
  try {
    const data = await dataPerson.findAll();
    res.status(200).json({
      message: 'Data semua users berhasil di peroleh',
      tani:data
    });  
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: error.message,
    });
  }
}

module.exports = {usersAll}