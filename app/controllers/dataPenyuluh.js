const { dataPerson, dataPenyuluh, presesiKehadiran, jurnalHarian, riwayatChat, tbl_akun } = require('../models');
const ApiError = require('../../utils/ApiError');
const imageKit = require('../../midleware/imageKit');
const dotenv = require('dotenv');
const bcrypt = require("bcrypt");
dotenv.config();
const tambahDataPenyuluh = async(req, res)=>{
  const {peran} = req.user || {};
  // console.log(peran)
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
        
        {/* Inisialisasi variabel yang akan digunakan */}
        const hashedPassword = bcrypt.hashSync(password, 10);
        const accountID = Math.floor(100000 + Math.random() * 900000);
        const { file, } = req;
        const penyuluh = await dataPenyuluh.findOne({ where: { nik:NIP, }, });
        let urlImg;
        if(!NIP) {
          throw new ApiError(400, "NIP tidak boleh kosong")
        }
        if(!nama) {
          throw new ApiError(400, "nama tidak boleh kosong")
        }
        if(penyuluh) {
          throw new ApiError(400, "NIP sudah digunakan")
        }
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
          try {
            const img = await imageKit.upload({
              file: file.buffer,
              fileName: `IMG-${Date.now()}.${ext}`,
            });
            urlImg = img.url;
          } catch (uploadError) {
            console.error('Error uploading image:', uploadError.message);
            // Handle the error, and possibly return an error response to the client.
            return res.status(500).json({
              status: 'failed',
              message: 'Error uploading image.',
            });
          }          
        }

      {/* Membuat akun untuk penyuluh yang didaftarkan */}
        const newAccount = await tbl_akun.create({
          email,
          password: hashedPassword,
          no_wa: NoWa,
          nama,
          pekerjaan,
          peran:"penyuluh",
          foto:urlImg,
          accountID: accountID,
        });
        
        {/* Menambahkan penyuluh yang didaftarkan */}
        const newPenyuluh = await dataPenyuluh.create({
          nik: NIP,
          nama: nama,
          foto:urlImg,
          alamat,
          email,
          noTelp: NoWa,
          kecamatan,
          desa,
          password: hashedPassword,
          namaProduct, 
          desaBinaan:desaBinaan,
          kecamatanBinaan,
          accountID: accountID,
        });
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
      await dataPenyuluh.destroy({
        where: {
          id
        }
      });
      await tbl_akun.destroy({
        where: {
          accountID:data.accountID
        }
      })
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
      const dataDaftarPenyuluh = await dataPenyuluh.findOne({where:{id:id}});
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
        } = req.body
        const { file, } = req;
        const data = await dataPenyuluh.findOne({
          where: {
            id,
          },
        });
        if (!data) throw new ApiError(400, "data tidak ditemukan.");
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
        const hashedPassword = bcrypt.hashSync(password, 10);
        const accountUpdate = await tbl_akun.update(
          {
            email,
            password: hashedPassword,
            no_wa: NoWa,
            nama,
            pekerjaan:'',
            peran:"petani",
            foto:urlImg,
          },
          {
            where: { accountID: data.accountID },
          }
        );
        const newDataPenyuluh = await dataPenyuluh.update(
          {nik,
            email,
            noTelp:NoWa,
            alamat,
            desa,
            nama,
            kecamatan,
            password: hashedPassword,
            namaProduct,
            kecamatanBinaan,
            desaBinaan,
          },
          {
            where: {
              id:id
            }
          })
        res.status(200).json({
          message: 'berhasil merubah data Penyuluh',
          newDataPenyuluh,
          accountUpdate
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