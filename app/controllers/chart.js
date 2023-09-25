const { chart } = require('../models');
const ApiError = require('../../utils/ApiError');
const { Op } = require('sequelize');
const Sequelize = require('sequelize');
const db = require('../models')
const addChart = async(req, res)=>{
  try {
    const {label,total,tanggalPanen,jenis, jenisPanen } = req.body 
    if(!jenisPanen) throw new ApiError(400, "Jenis Panen Tidak Boleh Kosong")
    if(!tanggalPanen) throw new ApiError(400, `${jenisPanen == 'Bulanan' ? 'Bulan Panen Tidak Boleh Kosong': 'Tahun Panen Tidak Boleh Kosong'}`)
    if(!jenis) throw new ApiError(400, "Jenis Komoditas Panen Tidak Boleh Kosong")
    if(!label) throw new ApiError(400, "Nama Komoditas Tidak Boleh Kosong")
    if(!total) throw new ApiError(400, "Banyaknya Komoditas Panen Tidak Boleh Kosong")
    const dataChart = await chart.create({label,total,tanggalPanen,jenis,jenisPanen})
    res.status(201).json({
      status:"succes",
      message:"Data Berhasil Ditambahkan",
      dataChart
    })
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: error.message,
    });
  }
}

const getChart = async(req, res)=>{
  const {jenisPanen, jenis} = req.query
  try {
    const startDate = new Date();
    const endDate = new Date();
    endDate.setFullYear(endDate.getFullYear() - 5);
    const datachart = await chart.findAll({
      attributes: [
        'label',
        [Sequelize.fn('SUM', Sequelize.col('total')), 'total'],
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'count'],
        [db.Sequelize.fn('YEAR', db.Sequelize.col('tanggalPanen')),'tahunPanen'],
      ],
      where: {
        tanggalPanen: {
          [Op.between]: [endDate, startDate], 
        },
        jenis,
        jenisPanen
      },
      group: ['label', 'tanggalPanen'],
    })
    res.status(200).json({
      datachart
    })
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: error.message,
    });
  }
}
const deleteChart = async(req, res)=>{
  const {id} = req.id
  try {
    await chart.destry({where:{id}})
    res.status(200).json({
      datachart
    })
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: error.message,
    });
  }
}

module.exports = {
  addChart,
  getChart
}