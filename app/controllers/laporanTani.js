const { laporanTanam, tanamanPetani } = require('../models');
const { Op } = require('sequelize');
const ApiError = require('../../utils/ApiError');
const imageKit = require('../../midleware/imageKit');

const tambahLaporanTanam = async(req, res)=>{
  try {
    const {
      tanamanPetaniId ,
      tanggalLaporan,
      komdisiTanaman,
      deskripsi,
    } = req.body
    if(!tanamanPetaniId) throw new ApiError(400, "Id Tanaman Petani Tidak Boleh Kosong")
    if(!tanggalLaporan) throw new ApiError(400, "Tanggal Laporan Tidak Boleh Kosong")
    if(!komdisiTanaman) throw new ApiError(400, "Kondisi Tanaman Tidak Boleh Kosong")
    if(!deskripsi) throw new ApiError(400, "Deskripsi Tanaman Tidak Boleh Kosong")
    const { file, } = req;
    if (file) {
      const validFormat =
        file.mimetype === 'image/png' ||
        file.mimetype === 'image/jpg' ||
        file.mimetype === 'image/jpeg' ||
        file.mimetype === 'image/gif';
      if (!validFormat) {
        return res.status(400).json({
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
      const newLaporanTanam = await laporanTanam.create({ tanamanPetaniId,tanggalLaporan, komdisiTanaman, deskripsi, fotoTanaman:img.url })
      return res.status(200).json({
      message: 'Berhasil Menambahakan laporan tanam',
      newLaporanTanam
    });  
    }
    const newLaporanTanam = await laporanTanam.create({ tanamanPetaniId,tanggalLaporan, komdisiTanaman, deskripsi})
    res.status(200).json({
      message: 'Berhasil Menambahakan laporan tanam',
      newLaporanTanam
    });  
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: error.message,
    });
  }
}
const getAllLaporanTanam = async(req, res)=>{
  const {id} = req.params
  try {
    const daftarTani = await tanamanPetani.findOne({
      include:{
        model:laporanTanam
      },
      where:{id},
    })
    res.status(200).json({
      message: 'Berhasil Mendapatkan laporan tanam',
      daftarTani
    });  
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: error.message,
    });
  }
}
const getLaporanTanamById = async(req, res)=>{
  const {id} = req.params
  try {
    const daftarTani = await laporanTanam.findOne({where:{id}})
    res.status(200).json({
      message: 'Berhasil Mendapatkan laporan tanam',
      daftarTani
    });  
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: error.message,
    });
  }
}
const editLaporanTanam = async(req, res)=>{
  try {
    const {
      tanggalLaporan,
      komdisiTanaman,
      deskripsi,
    } = req.body
    if(!tanggalLaporan) throw new ApiError(400, "Tanggal Laporan Tidak Boleh Kosong")
    if(!komdisiTanaman) throw new ApiError(400, "Kondisi Tanaman Tidak Boleh Kosong")
    if(!deskripsi) throw new ApiError(400, "Deskripsi Tanaman Tidak Boleh Kosong")
    const {id} = req.params
    const { file, } = req;
    if (file) {
      const validFormat =
        file.mimetype === 'image/png' ||
        file.mimetype === 'image/jpg' ||
        file.mimetype === 'image/jpeg' ||
        file.mimetype === 'image/gif';
      if (!validFormat) {
        return res.status(400).json({
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
      await laporanTanam.update({ tanggalLaporan, komdisiTanaman, deskripsi, fotoTanaman:img.url },{where:{id}})
      const newLaporanTanam = laporanTanam.findOne({where:{id}})
      return res.status(200).json({
      message: 'Berhasil Merubah laporan tanam',
      newLaporanTanam
    });  
    }
    await laporanTanam.update({ tanggalLaporan, komdisiTanaman, deskripsi},{where:{id}})
    const newLaporanTanam = laporanTanam.findOne({where:{id}})
    res.status(200).json({
      message: 'Berhasil Merubah laporan tanam',
      newLaporanTanam
    });  
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: error.message,
    });
  }
}

module.exports = {
  tambahLaporanTanam,
  getAllLaporanTanam,
  getLaporanTanamById,
  editLaporanTanam
}