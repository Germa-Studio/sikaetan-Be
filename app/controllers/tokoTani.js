const { dataPerson, penjual  } = require('../models');
const ApiError = require('../../utils/ApiError');
const imageKit = require('../../midleware/imageKit');


const tambahDaftarPenjual = async(req, res)=>{
  try {
    const {
      NIK,
      NIP,
      profesiPenjual,
      namaProducts,
      stok,
      satuan,
      harga,
      deskripsi,
      status
    }= req.body
    let id
    if(profesiPenjual == "penyuluh"){
      if(!NIP) throw new ApiError(400, "NIP tidak boleh kosong")
      const persons = await dataPerson.findOne({ where: { NIP, role:"penyuluh" }, });
      if(!persons) throw new ApiError(400, `data dengan NIP ${NIP} tidak terdaftar`)
      id = persons.id
    }else{
      if(!NIK) throw new ApiError(400, "NIK tidak boleh kosong")
      const persons = await dataPerson.findOne({ where: { NIK, role:"petani" }, });
      if(!persons) throw new ApiError(400, `data dengan nik ${NIK} tidak terdaftar`)
      id = persons.id
    }
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
      const newPenjual = await penjual.create({profesiPenjual, namaProducts, stok, satuan, harga, deskripsi, fotoTanaman:img.url, status, dataPersonId:id })
      const dataPenjual = await penjual.findOne({where:{id:newPenjual.id}, include:dataPerson})
      return res.status(200).json({
        message: 'Berhasil Membuat Data Penjual',
        dataPenjual
      });
    }
    const newPenjual = await penjual.create({profesiPenjual, namaProducts, stok, satuan, harga, deskripsi, status, dataPersonId:id })
    const dataPenjual = await penjual.findOne({where:{id:newPenjual.id}, include:dataPerson})
    return res.status(200).json({
      message: 'Berhasil Membuat Data Penjual',
      dataPenjual
    });
  } catch (error) {
    console.log(error)
    res.status(error.statusCode || 500).json({
      message: error.message,
    });
  }
}
const productPetani = async(req, res)=>{
  try {
    const data = await penjual.findAll({
      include: [
        {
          model: dataPerson,
          required: true
        }
      ],
      where: {
        profesiPenjual:"Petani"
      },
    });
    res.status(200).json({
      message: 'Berhasil Mendapatkan Product Petani',
      productPetani:data
    });  
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: error.message,
    });
  }
}
const productPenyuluh = async(req, res)=>{
  try {
    const data = await penjual.findAll({
      include: [
        {
          model: dataPerson,
          required: true
        }
      ],
      where: {
        profesiPenjual:"Penyuluh"
      },
    });
    res.status(200).json({
      message: 'Berhasil Mendapatkan Product Penyuluh',
      productPenyuluh:data
    });  
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: error.message,
    });
  }
}

module.exports = {
  tambahDaftarPenjual,
  productPetani,
  productPenyuluh,
}