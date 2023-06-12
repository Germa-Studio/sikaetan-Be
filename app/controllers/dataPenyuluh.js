const { dataPerson, dataPenyuluh, presesiKehadiran, jurnalHarian, riwayatChat } = require('../models');
const ApiError = require('../../utils/ApiError');
const imageKit = require('../../midleware/imageKit');

const tambahDataPenyuluh = async(req, res)=>{
  try {
   const {
    NIP,
    NoWa,
    alamat,
    desa,
    nama,
    kecamatan,
    password,
    namaProduct,
    kecamatanBinaan,
    desaBinaan
    } = req.body
    const { file, } = req;
    let urlImg
    if(!NIP) throw new ApiError(400, "NIP tidak boleh kosong")
    if(!nama) throw new ApiError(400, "nama tidak boleh kosong")
    const tani = await dataPerson.findOne({ where: { NIP, }, });
    if(tani) throw new ApiError(400, "NIP sudah digunakan")
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
    const newPerson = await dataPerson.create({NIP, NoWa, alamat, desa, nama, kecamatan, password, foto:urlImg, role:"penyuluh" })
    for(i=1; i<desaBinaan.length; i++){
      await dataPenyuluh.create({namaProduct, desaBinaan:desaBinaan[i],kecamatanBinaan, dataPersonId:newPerson.id })
    }
    const newDataPenyuluh = await dataPerson.findOne({where:{id:newPerson.id}, indlude:[{model:dataPenyuluh}]})
    res.status(200).json({
      message: 'berhasil menambahkan data Penyuluh',
      newDataPenyuluh
    });  
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: error.message,
    });
  }

}
const presensiKehadiran = async(req, res)=>{
  try {
    const DataPresesiKehadiran = await dataPerson.findAll({include:[{model:presesiKehadiran, required:true}, {model:dataPenyuluh}]});
    res.status(200).json({
      message: 'Semua Data Presensi Kehadiran',
      DataPresesiKehadiran
    });  
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: error.message,
    });
  }
}
const tambahPresensiKehadiran = async(req, res)=>{
  try {
   const {
    NIP,
    tanggalPresesi,
    jamKedatangan,
    jamPulang
    } = req.body
    const tani = await dataPerson.findOne({ where: { NIP, }, });
    if(!tani) throw new ApiError(400, "NIP Tidak Ditemukan")
    const newPresesiKehadiran = await presesiKehadiran.create({tanggalPresesi, jamKedatangan, jamPulang })
    await dataPerson.update({presesiKehadiranId:newPresesiKehadiran.id},{
      where: {
        NIP
      }
    })
    const newData = await dataPerson.findOne({ where: { NIP, }, include:[{model:presesiKehadiran, required:true}, {model:dataPenyuluh}]});
    res.status(200).json({
      message: 'Brhasil menambhakan Data Presensi Kehadiran',
      newData
    });  
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: error.message,
    });
  }
}

const jurnalKegiatan = async(req, res)=>{
  try {
    const newData = await dataPerson.findAll({include:[{model:jurnalHarian, required:true}, {model:dataPenyuluh}]});
    res.status(200).json({
      message: 'berhasil mendapatkan data Jurnal',
      newData
    });   
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: error.message,
    });
  }
}
const tambahJurnalKegiatan = async(req, res)=>{
  try {
   const {
    NIP,
    judul,
    tanggalDibuat,
    uraian,
    statusJurnal
    } = req.body
    const { file, } = req;
    let urlImg
    if(!NIP) throw new ApiError(400, "NIP tidak boleh kosong")
    const tani = await dataPerson.findOne({ where: { NIP, }, });
    if(!tani) throw new ApiError(400, "NIP tidak Ditemukan")
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
    const dataJurnalHarian = await jurnalHarian.create({judul, tanggalDibuat, uraian, statusJurnal, gambar:urlImg, })
    await dataPerson.update({jurnalKegiatanId:dataJurnalHarian.id},{
      where: {
        NIP
      }
    })
    const newData = await dataPerson.findOne({ where: { NIP, }, include:[{model:jurnalHarian, required:true}, {model:dataPenyuluh}]});
    res.status(200).json({
      message: 'berhasil menambahkan data Jurnal',
      newData
    });  
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: error.message,
    });
  }
}


const RiwayatChat = async(req, res)=>{
  try {
    const dataRiwayatChat = await dataPerson.findAll({include:[{model:riwayatChat, required:true}, {model:dataPenyuluh}]});
    res.status(200).json({
      message: 'Semua Data Riwayat Chat',
      dataRiwayatChat
    });  
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: error.message,
    });
  }
}
const daftarPenyuluh = async(req, res)=>{
  try {
    const dataDaftarPenyuluh = await dataPerson.findAll({where:{role:"penyuluh"},include:[{model:dataPenyuluh}]});
    res.status(200).json({
      message: 'Semua Data Riwayat Chat',
      dataDaftarPenyuluh
    });  
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: error.message,
      O:"kkkkkkkkkkkkk"
    });
  }
}



module.exports = {
  tambahDataPenyuluh,
  presensiKehadiran,
  jurnalKegiatan,
  RiwayatChat,
  tambahJurnalKegiatan,
  tambahPresensiKehadiran,
  daftarPenyuluh
}