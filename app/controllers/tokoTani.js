const { dataPerson, penjual  } = require('../models');
const ApiError = require('../../utils/ApiError');
const imageKit = require('../../midleware/imageKit');

const tambahDaftarPenjual = async(req, res)=>{
  try {
    const {
      NIK,
      profesiPenjual,
      namaProducts,
      stok,
      satuan,
      harga,
      deskripsi,
      status
    }= req.body
    const tani = await dataPerson.findOne({ where: { NIK, }, });
    if(tani) throw new ApiError(400, `data dengan nik ${NIK} tidak terdaftar`)
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
    const newPenjual = await penjual.create({profesiPenjual, namaProducts, stok, satuan, harga, deskripsi, fotoTanaman, status })
    await dataPerson.update({penjualId:newPenjual.id},{where:{NIK}})
    const dataPenjual = await penjual.findOne({where:{id:newPenjual.id}})
    res.status(200).json({
      message: 'Berhasil Membuat Data Penjual',
      dataPenjual
    });
  } catch (error) {
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