const { dataPerson, tanamanPetani, kelompok, laporanTanam } = require('../models');
const { Op } = require('sequelize');
const ApiError = require('../../utils/ApiError');
const imageKit = require('../../midleware/imageKit');

const laporanPetani = async(req, res)=>{
  try {
    const data = await dataPerson.findAll({
      include: [
        {
          model: kelompok,
        },
        {
          model: tanamanPetani,
        },
        {
          model: laporanTanam,
          required: true
        }
      ],
      where: {
        NIK: {
          [Op.not]: null
        }
      },
    });
    res.status(200).json({
      message: 'Data laporan Tani Berhasil Diperoleh',
      tani:data
    });  
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: error.message,
    });
  }
}
const laporanPenyuluh = async(req, res)=>{
  try {
    const data = await dataPerson.findAll({
      include: [
        {
          model: kelompok,
        },
        {
          model: tanamanPetani,
        },
        {
          model: laporanTanam,
          required: true
        }
      ],
      where: {
        NIP: {
          [Op.not]: null
        }
      },
    });
    res.status(200).json({
      message: 'Data laporan Penyuluh Berhasil Diperoleh',
      penyuluh : data
    });  
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: error.message,
    });
  }
}
const tambahDaftarTani = async(req, res)=>{
  try {
    const {
    NIK,
    NoWa,
    alamat,
    desa,
    nama,
    kecamatan,
    password,
    gapoktan,
    penyuluh,
    namaKelompok,
    statusLahan,
    luasLahan,
    kategori,
    jenis,
    komoditas,
    musimTanam,
    tanggalTanam,
    perkiraanPanen
    } = req.body

    if(!NIK) throw new ApiError(400, "NIK tidak boleh kosong")
    if(!nama) throw new ApiError(400, "nama tidak boleh kosong")
    const tani = await dataPerson.findOne({ where: { NIK, }, });
    if(tani) throw new ApiError(400, "NIK sudah digunakan")
    const { file, } = req;
    let urlImg
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
    const dataKelompok = await kelompok.create({gapoktan, penyuluh, namaKelompok})
    const dataTanamanPetani = await tanamanPetani.create({statusLahan, luasLahan, kategori, jenis, komoditas, musimTanam, tanggalTanam, perkiraanPanen })
    const daftarTani = await dataPerson.create({NIK, NoWa, alamat, desa, nama, kecamatan, password, tanamanPetaniId: dataTanamanPetani.id,kelompokId:dataKelompok.id, foto:urlImg })

    res.status(200).json({
      message: 'Berhasil Menambahakan Daftar Tani',
      daftarTani
    });  
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: error.message,
    });
  }
}
const tambahLaporanTani = async(req, res)=>{
  try {
    const {
      NIK,
      tanggalLaporan,
      komdisiTanaman,
      deskripsi,
    } = req.body
    const { file, } = req;
    let urlImg
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

    const dataLaporanTanam = await laporanTanam.create({tanggalLaporan, komdisiTanaman, deskripsi, fotoTanaman:urlImg })
    await dataPerson.update({ laporanTanamId: dataLaporanTanam.id }, {
      where: {
        NIK
      }
    })
    res.status(200).json({
      message: 'Berhasil Menambahkan Laporan',
      dataLaporanTanam
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