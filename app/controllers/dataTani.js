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
        }
      ],
      where: {
        role:"petani"
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
    } = req.body

    if(!NIK) throw new ApiError(400, "NIK tidak boleh kosong")
    if(!nama) throw new ApiError(400, "nama tidak boleh kosong")
    if(!penyuluh) throw new ApiError(400, "penyuluh tidak boleh kosong")
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
      img.url
      console.log({...req.body, img:img.url})
    }
    const dataKelompok = await kelompok.create({gapoktan, penyuluh, namaKelompok, desa})
    const daftarTani = await dataPerson.create({NIK, NoWa, role:"petani", alamat, desa, nama, kecamatan, password, kelompokId:dataKelompok.id, foto:urlImg })

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
const daftarTani = async(req, res)=>{
  try {
    const data = await dataPerson.findAll({
      where: {
        role:"petani"
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
const deleteDaftarTani = async(req, res)=>{
  const { id } = req.params
  try {
    const data = await dataPerson.findOne({
      where: {
        id
      }
    });
    if(!data) throw new ApiError(400, 'data tidak ditemukan.');
    await dataPerson.destroy({
      where: {
        id
      }
    });
    res.status(200).json({
      message: 'Petani Berhasil Di Hapus',
    });  
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: `gagal menghapus data petani, ${error.message}`,
    });
  }
}
const dataTaniDetail = async(req, res)=>{
  const { id } = req.params
  try {
    const data = await dataPerson.findOne({
      where: {
        id
      }
    });
    res.status(200).json({
      message: 'Petani Berhasil Di Peroleh',
      detailTani: data
    });  
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: `gagal mendapatkan data petani, ${error.message}`,
    });
  }
}
const updateTaniDetail = async(req, res)=>{
  const { id } = req.params
  const {NIK, NoWa, alamat, desa, nama, kecamatan, password } = req.body

  try {
    const data = await dataPerson.findOne({
      where: {
        id
      }
    });
    if(!data) throw new ApiError(400, 'data tidak ditemukan.');
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
      await dataPerson.update({
        NIK, NoWa, alamat, desa, nama, kecamatan, password, foto: img.url
      },{
        where: {
          id
        }
      });
      return res.status(200).json({
          message: 'Petani Berhasil Di update',
          detailTani: data
        });
    }
    await dataPerson.update({
      NIK, NoWa, alamat, desa, nama, kecamatan, password
    },{
      where: {
        id
      }
    });
    res.status(200).json({
      message: 'Petani Berhasil Di update',
      detailTani: data
    });  
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: `gagal update data petani`,
    });
  }
}

const getTanamanPetani =  async(req, res)=>{
  const { id } = req.params
  try {
    const data = await dataPerson.findOne({
      include: [
        {
          model: kelompok,
        },
        {
          model: tanamanPetani,
        },
      ],
      where: {
        role:"petani",
        id
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
const tambahTanamanPetani = async(req, res)=>{
  try {
    console.log(req.body)
    const {
      dataPersonId,
      statusLahan,
      luasLahan,
      kategori,
      jenis,
      jenisPanen,
      komoditas,
      musimTanam,
      tanggalTanam,
      perkiraanPanen,
      perkiraanHasilPanen,
    } = req.body
    for(const key in req.body){
      if(!req.body[key] && key != 'jenis'){
        throw new ApiError(400, `${key} harus di isi`)
      }
    }
    const data = await dataPerson.findOne({
      where: {
        role:"petani",
        id: dataPersonId
      }
    });
    if(!data){
      throw new ApiError(400, "data petani tidak sesuai")
    }
    const dataTanamanPetani = await tanamanPetani.create({perkiraanHasilPanen, perkiraanPanen,tanggalTanam,musimTanam,komoditas, jenisPanen, jenis, kategori, dataPersonId, statusLahan, luasLahan })
    res.status(200).json({
      message: 'Berhasil Menambahkan Tanaman Petani',
      dataTanamanPetani
    });  
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: error.message,
    });
  }
}
const ubahTanamanPetaniById = async(req, res)=>{
  try {
    const {id}= req.params
    const {
      statusLahan,
      luasLahan,
      kategori,
      jenis='-',
      janisPanen,
      komoditas,
      musimTanam,
      tanggalTanam,
      perkiraanPanen,
      perkiraanHasilPanen,
      realisasiHasilPanen
    } = req.body
    for(const key in req.body){
      if(!req.body[key] && key != 'jenis'){
        throw new ApiError(400, `${key} harus di isi`)
      }
    }
    const data = await tanamanPetani.findOne({
      where: {
        id
      }
    });
    if(!data){
      throw new ApiError(400, "data petani tidak sesuai")
    }
    await tanamanPetani.update({realisasiHasilPanen, perkiraanHasilPanen, perkiraanPanen,tanggalTanam,musimTanam,komoditas, janisPanen, jenis, kategori, statusLahan, luasLahan},{
      where:{id}
    })
    res.status(200).json({
      message: 'Berhasil Merubah Tanaman Petani',
    });  
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: error.message,
    });
  }
}
const getTanamanPetaniById = async(req, res)=>{
  const { id } = req.params
  try {
    const data = await tanamanPetani.findOne({
      where: {
        id,
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
const deleteTanamanPetaniById = async(req, res)=>{
  const { id } = req.params
  try {
    const data = await tanamanPetani.findOne({
      where: {
        id
      }
    });
    if(!data) throw new ApiError(400, 'data tidak ditemukan.');
    await tanamanPetani.destroy({
      where: {
        id
      }
    });
    res.status(200).json({
      message: 'Tanaman Petani Berhasil Di Hapus',
    });  
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: `gagal menghapus data Tanaman petani`,
    });
  }
}


module.exports = {
  laporanPetani,
  laporanPenyuluh,
  tambahDaftarTani,
  tambahLaporanTani,
  daftarTani,
  deleteDaftarTani,
  dataTaniDetail,
  updateTaniDetail,
  getTanamanPetani,
  tambahTanamanPetani,
  getTanamanPetaniById,
  ubahTanamanPetaniById,
  deleteTanamanPetaniById
}