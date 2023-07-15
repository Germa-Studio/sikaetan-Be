const { eventTani:EventTani, beritaTani } = require('../models');
const ApiError = require('../../utils/ApiError');
const imageKit = require('../../midleware/imageKit');

const infoTani = async(req, res)=>{
  try {
    const data = await beritaTani.findAll({order: [['id', 'DESC']]});
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
const infoTaniById = async(req, res)=>{
  const { id } = req.params
  try {
    const data = await beritaTani.findOne({where:{id}});
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
    if (!judul) throw new ApiError(400, 'Judul tidak boleh kosong.');
    if (!tanggal) throw new ApiError(400, 'tanggal tidak boleh kosong.');
    if (!kategori) throw new ApiError(400, 'kategori tidak boleh kosong.');
    if (!isi) throw new ApiError(400, 'isi tidak boleh kosong.');
    const { file, } = req;
    let urlImg = ''
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
    const data = await EventTani.findAll({order: [['id', 'DESC']]});
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
const eventTaniById = async(req, res)=>{
  const { id } = req.params
  try {
    const data = await EventTani.findOne({where:{id}});
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
    if (!namaKegiatan) throw new ApiError(400, 'namaKegiatan tidak boleh kosong.');
    if (!tanggalAcara) throw new ApiError(400, 'tanggalAcara tidak boleh kosong.');
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

const deleteInfoTani = async(req, res)=>{
  try {
    const beritaId = req.params.id;
    const data = await beritaTani.findOne({
      where: {
        id: beritaId
      }
    });
    if(!data) throw new ApiError(400, 'data tidak ditemukan.');
    await beritaTani.destroy({
      where: {
        id: beritaId
      }
    });
    res.status(200).json({
      message: 'Berita Tani Berhasil DI Hapus',
    });  
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: `gagal menghapus data, ${error.message}`,
    });
  }
}
const deleteEventTani = async(req, res)=>{
  try {
    const eventId = req.params.id;
    const data = await EventTani.findOne({
      where: {
        id: eventId
      }
    });
    if(!data) throw new ApiError(400, 'data tidak ditemukan.');
    await EventTani.destroy({
      where: {
        id: eventId
      }
    });
    res.status(200).json({
      message: 'event Tani Berhasil DI Hapus',
    });  
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: `gagal menghapus data, ${error.message}`,
    });
  }
}
const updateInfoTani = async(req, res)=>{
  try {
    const {
    judul,
    tanggal,
    status,
    kategori,
    createdBy,
    isi
    } = req.body
    const beritaId = req.params.id;

    const data = await beritaTani.findOne({
      where: {
        id: beritaId
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
      await beritaTani.update(  
        { 
          judul,status,kategori,fotoBerita: img.url,isi
        },
        { where: { id: beritaId } })
      return res.status(200).json({
        message: 'Berita Tani Berhasil Di ubah',
      });
    }
    await beritaTani.update(  
      { 
        judul,status,kategori,isi
      },
      { where: { id: beritaId } })
    res.status(200).json({
      message: 'Berita Tani Berhasil DI ubah tanpa image',
    });
  } catch (error) {
        console.log(error)
    res.status(error.statusCode || 500).json({
      message: `gagal menghapus data, ${error.message}`,
    });
  }
}
const updateEventTani = async(req, res)=>{
  try {
    const {
      namaKegiatan,
      tanggalAcara,
      waktuAcara,
      tempat,
      peserta,
      createdBy,
      isi
    } = req.body
    const eventId = req.params.id;
    const data = await EventTani.findOne({
      where: {
        id: eventId
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
      await EventTani.update(  
        { 
          namaKegiatan,tanggalAcara,waktuAcara,tempat,peserta,fotoKegiatan:img.url,createdBy,isi
        },
        { where: { id: eventId } })
      return res.status(200).json({
        message: 'Event Tani Berhasil Di ubah',
      });
    }
    await EventTani.update(  
      { 
        namaKegiatan,tanggalAcara,waktuAcara,tempat,peserta,createdBy,isi
      },
      { where: { id: eventId } })
    res.status(200).json({
      message: 'Event Tani Berhasil DI update',
    });  
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: `gagal menghapus data, ${error.message}`,
    });
  }
}

module.exports = {
        infoTani,
        tambahInfoTani,
        eventTani,
        tambahEventTani,
        deleteInfoTani,
        deleteEventTani,
        infoTaniById,
        eventTaniById,
        updateEventTani,
        updateInfoTani
    }