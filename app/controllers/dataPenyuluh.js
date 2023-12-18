const { dataPerson, dataPenyuluh, presesiKehadiran, jurnalHarian, riwayatChat, tbl_akun } = require('../models');
const ApiError = require('../../utils/ApiError');
const imageKit = require('../../midleware/imageKit');
const dotenv = require('dotenv');
const bcrypt = require("bcrypt");
dotenv.config();
const tambahDataPenyuluh = async(req, res)=>{
  const {nama, peran} = req.user || {};
  console.log(peran)
  try {
    if (
      peran !== "admin" &&
      peran !== "super admin"
    ){
      throw new ApiError(400, 'Anda tidak memiliki akses.');
    }else{
      const {
        NIP,
        email,
        NoWa,
        alamat,
        desa,
        nama,
        kecamatan,
        password,
        namaProduct,
        kecamatanBinaan,
        desaBinaan,
        pekerjaan = "",
        } = req.body
        const hashedPassword = bcrypt.hashSync(password, 10);
        const { file, } = req;
        let urlImg
        if(!NIP) throw new ApiError(400, "NIP tidak boleh kosong")
        if(!nama) throw new ApiError(400, "nama tidak boleh kosong")
        const tani = await dataPenyuluh.findOne({ where: { nik, }, });
        if(tani) throw new ApiError(400, "NIK sudah digunakan")
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
        const newAccount = await tbl_akun.create({
          email,
          password: hashedPassword,
          no_wa: NoWa,
          nama,
          pekerjaan,
          peran:"penyuluh",
          foto: `${file ? urlImg : ""}`,
        });
        // const newPerson = await dataPerson.create({NIP, NoWa, alamat, desa, nama, kecamatan, password, foto:urlImg, role:"penyuluh" })
        const newPenyuluh = await dataPenyuluh.create({
          nik: NIP,
          nama: nama,
          foto: `${file ? urlImg : ""}`,
          alamat,
          email,
          noTelp: NoWa,
          kecamatan,
          desa,
          password: hashedPassword,
          namaProduct, 
          desaBinaan:desaBinaan,
          kecamatanBinaan
        });
        // const newDataPenyuluh = await dataPerson.findOne({where:{id:newPerson.id}, indlude:[{model:dataPenyuluh}]})
        res.status(200).json({
          message: 'berhasil menambahkan data Penyuluh',
          newPenyuluh,
          newAccount
        });  
    }
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: error.message,
    });
  }

}
const daftarPenyuluh = async(req, res)=>{
  const {nama, peran} = req.user|| {};
  // console.log(peran)
  try {
    if (
      peran !== "admin" &&
      peran !== "super admin" &&
      peran !== 'penyuluh'
    ){
      throw new ApiError(400, 'Anda tidak memiliki akses.');
    }else{
      const dataDaftarPenyuluh = await dataPenyuluh.findAll();
      res.status(200).json({
        message: 'Semua Data Penyuluh',
        dataDaftarPenyuluh
      });  
    }
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: error.message,
    });
  }
}
const deleteDaftarPenyuluh = async(req, res)=>{
  const { id } = req.params
  const {nama, peran} = req.user || {};
  try {
    if (
      peran !== "admin" &&
      peran !== "super admin"
    ){
      throw new ApiError(400, 'Anda tidak memiliki akses.');
    }else{
      const data = await dataPenyuluh.findOne({
        where: {
          id:id
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
    }
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: `gagal menghapus data petani, ${error.message}`,
    });
  }
}

// presensi Kehadiran
const presensiKehadiran = async(req, res)=>{
  const {nama, peran} = req.user|| {};
  try {
    if (
      peran !== "admin" &&
      peran !== "super admin" &&
      peran !== 'PENYULUH'
    ){
      throw new ApiError(400, 'Anda tidak memiliki akses.');
    }else{
      const DataPresesiKehadiran = await dataPerson.findAll({include:[{model:presesiKehadiran, required:true}, {model:dataPenyuluh}]});
      res.status(200).json({
        message: 'Semua Data Presensi Kehadiran',
        DataPresesiKehadiran
      });  
    }
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: error.message,
    });
  }
}
const presensiKehadiranWeb = async(req, res)=>{
  const {peran} = req.user || {};
  try {
    if (
      peran !== "admin" &&
      peran !== "super admin" &&
      peran !== 'PENYULUH'
    ){
      throw new ApiError(400, 'Anda tidak memiliki akses.');
    }else{
      const DataPresesiKehadiran = await presesiKehadiran.findAll({
        include:{
          model:dataPerson,
          required:true,
          include:{
            model:dataPenyuluh
          }
        }
        });
      res.status(200).json({
        message: 'Semua Data Presensi Kehadiran',
        DataPresesiKehadiran
      });  
    }
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: error.message,
    });
  }
}
const tambahPresensiKehadiran = async(req, res)=>{
  const {nama, peran} = req.user || {};
  try {
    if (
      peran !== "admin" &&
      peran !== "super admin" &&
      peran !== 'penyuluh'
    ){
      throw new ApiError(400, 'Anda tidak memiliki akses.');
    }else{
    const {
      NIP="",
      tanggalPresensi,
      judulKegiatan,
      deskripsiKegiatan,
      } = req.body
      const {file} = req
      const penyuluh = await dataPerson.findOne({ where: { NIP, }, });

      if(!penyuluh) throw new ApiError(400, `Penyulih dengan NIP ${NIP} Tidak Ditemukan`)
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
        const newData = await presesiKehadiran.create({id:penyuluh.id,tanggalPresesi:tanggalPresensi, judulKegiatan, deskripsiKegiatan, FotoKegiatan: img.url })
        return res.status(200).json({
          message: 'Brhasil menambhakan Data Presensi Kehadiran',
          newData
        });  
      }
      const newData = await presesiKehadiran.create({id:penyuluh.id,tanggalPresesi:tanggalPresensi, judulKegiatan, deskripsiKegiatan})
      res.status(200).json({
        message: 'Brhasil menambhakan Data Presensi Kehadiran',
        newData
      });  
    }
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: error.message,
    });
  }
}

// Jurnal Kegiatan
const jurnalKegiatan = async(req, res)=>{
  console.log(req)
  const {peran} = req.user || {};
  try {
    if (
      peran !== "admin" &&
      peran !== "super admin" &&
      peran !== 'PENYULUH'
    ){
      throw new ApiError(400, 'Anda tidak memiliki akses.');
    }else{
      const newData = await dataPerson.findAll({include:[{model:jurnalHarian, required:true}, {model:dataPenyuluh}]});
    res.status(200).json({
      message: 'berhasil mendapatkan data Jurnal',
      newData
    });  
    }
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: error.message,
    });
  }
}
const tambahJurnalKegiatan = async(req, res)=>{
  const {peran} = req.user || {};
  try {
    if (
      peran !== "admin" &&
      peran !== "super admin" &&
      peran !== 'PENYULUH'
    ){
      throw new ApiError(400, 'Anda tidak memiliki akses.');
    }else{
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
    }
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: error.message,
    });
  }
}

// riwayat chat
const RiwayatChat = async(req, res)=>{
  const {peran} = req.user || {};
  try {
    if (
      peran !== "admin" &&
      peran !== "super admin" &&
      peran !== 'penyuluh'
    ){
      throw new ApiError(400, 'Anda tidak memiliki akses.');
    }else{
      const dataRiwayatChat = await dataPerson.findAll({include:[{model:riwayatChat, required:true}, {model:dataPenyuluh}]});
      res.status(200).json({
        message: 'Semua Data Riwayat Chat',
        dataRiwayatChat
      });  
    }
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: error.message,
    });
  }
}
const daftarPenyuluhById = async(req, res)=>{
  const {id} = req.params
  const {nama, peran} = req.user || {};
  try {
    if (
      peran !== "admin" &&
      peran !== "super admin" &&
      peran !== 'PENYULUH'
    ){
      throw new ApiError(400, 'Anda tidak memiliki akses.');
    }else{
      const dataDaftarPenyuluh = await dataPerson.findOne({where:{id:id,role:"penyuluh"},include:[{model:dataPenyuluh}]});
      res.status(200).json({
        message: 'Semua Data penyuluh',
        dataDaftarPenyuluh
      });  
    }
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: error.message,
    });
  }
}
const updatePenyuluh = async(req, res)=>{
  const {id} = req.params
  const {nama, peran} = req.user || {};
  try {
    if (
      peran !== "admin" &&
      peran !== "super admin" &&
      peran !== 'penyuluh'
    ){
      throw new ApiError(400, 'Anda tidak memiliki akses.');
    }else{
      const {
        nik,
        email,
        NoWa,
        alamat,
        desa,
        nama,
        kecamatan,
        password,
        namaProduct,
        kecamatanBinaan,
        desaBinaan,
        pekerjaan = "",
        } = req.body
        const { file, } = req;
        let urlImg
        if(!nik) throw new ApiError(400, "NIP tidak boleh kosong")
        if(!nama) throw new ApiError(400, "nama tidak boleh kosong")
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
        const newDataPenyuluh = await dataPenyuluh.update(
          {nik,
            email,
            NoWa,
            alamat,
            desa,
            nama,
            kecamatan,
            password,
            namaProduct,
            kecamatanBinaan,
            desaBinaan,
            pekerjaan :"",},
          {
            where: {
              id:id
            }
          })
        res.status(200).json({
          message: 'berhasil merubah data Penyuluh',
          newDataPenyuluh
        });  
    }
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
  RiwayatChat,
  tambahJurnalKegiatan,
  tambahPresensiKehadiran,
  daftarPenyuluh,
  deleteDaftarPenyuluh,
  presensiKehadiranWeb,
  daftarPenyuluhById,
  updatePenyuluh
}