const { eventTani:EventTani, beritaTani } = require('../models');
const ApiError = require('../../utils/ApiError');
const imageKit = require('../../midleware/imageKit');

const infoTani = async(req, res)=>{
  try {
    const data = await beritaTani.findAll();
    res.status(200).json({
      message: 'Berhasil Mendapatkan Data Info Tani',
      infotani:data
    });  
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: error.message,
    });
  }
}
const tambahInfoTani = async(req, res)=>{
  try {
    const {
    judul,
    tanggal,
    status,
    kategori,
    isi
    } = req.body
    const {nama} = req.user
    const { file, } = req;
    let urlImg = ''
    if (file) {
      const validFormat =
        file.mimetype === 'image/png' ||
        file.mimetype === 'image/jpg' ||
        file.mimetype === 'image/jpeg' ||
        file.mimetype === 'image/gif';
      if (!validFormat) {
        res.status(400).json({
          status: 'failed',
          message: 'Wrong Image Format',
        });
      }
      const split = file.originalname.split('.');
      const ext = split[split.length - 1];

      // upload file ke imagekit
      const img = await imageKit.upload({
        file: file.buffer,
        fileName: `IMG-${Date.now()}.${ext}`,
      });
      urlImg = img.url
    }
    console.log(urlImg)
    const infoTani = await beritaTani.create({judul, tanggal, status, kategori, fotoBerita:urlImg, createdBy:nama, isi})
    res.status(200).json({
      message: 'Info Tani Berhasil Dibuat',
      infoTani
    });  
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: error.message,
    });
  }
}
const eventTani = async(req, res)=>{
  try {
    const data = await EventTani.findAll();
    res.status(200).json({
      message: 'Berhasil Mendapatkan Data Info Tani',
      infotani:data
    });  
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: error.message,
    });
  }
}
const tambahEventTani = async(req, res)=>{
  try {
    const {
    namaKegiatan,
    tanggalAcara,
    waktuAcara,
    tempat,
    peserta,
    isi
    } = req.body
    const {nama} = req.user
    const { file, } = req;
    let urlImg = ''
    if (file) {
      const validFormat =
        file.mimetype === 'image/png' ||
        file.mimetype === 'image/jpg' ||
        file.mimetype === 'image/jpeg' ||
        file.mimetype === 'image/gif';
      if (!validFormat) {
        res.status(400).json({
          status: 'failed',
          message: 'Wrong Image Format',
        });
      }
      const split = file.originalname.split('.');
      const ext = split[split.length - 1];

      // upload file ke imagekit
      const img = await imageKit.upload({
        file: file.buffer,
        fileName: `IMG-${Date.now()}.${ext}`,
      });
      urlImg = img.url
    }
    const evenTani = await EventTani.create({namaKegiatan, tanggalAcara, waktuAcara, tempat, peserta, fotoKegiatan:urlImg, createdBy:nama, isi})
    res.status(200).json({
      message: 'Event Berhasil Dibuat',
      evenTani
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