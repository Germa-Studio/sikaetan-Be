const { kelompok, dataPerson, dataPenyuluh, kecamatan, desa } = require('../models');

const selectTani = async (req, res) => {
  try {
    const { kecamatan } = req.params;
    const penyuluh = await dataPerson.findAll({
      attributes: ['nama'],
      include: {
        model: dataPenyuluh,
        attributes: ['kecamatanBinaan']
      },
      where: {
        '$dataPenyuluh.kecamatanBinaan$': kecamatan
      }
    });
    res.status(200).json({
      message: 'Berhasil Mendapatkan Data Info Tani',
      penyuluh
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: error.message
    });
  }
};
const selectKelompok = async (req, res) => {
  try {
    const { desa } = req.params;
    const kelompokTani = await kelompok.findAll({
      where: { desaId: desa }
      // include: [
      //   {
      //     model: kecamatan,
      //     as: 'kecamatanData'
      //   },
      //   {
      //     model: desa,
      //     as: 'desaData'
      //   }
      // ]
    });
    res.status(200).json({
      message: 'Berhasil Mendapatkan Data Info Tani',
      kelompokTani
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: error.message
    });
  }
};

const selectKelompokById = async (req, res) => {
  try {
    const { id } = req.params;
    const kelompokTani = await kelompok.findOne({
      where: { id },
      include: [
        {
          model: kecamatan,
          as: 'kecamatanData'
        },
        {
          model: desa,
          as: 'desaData'
        }
      ]
    });

    res.status(200).json({
      message: 'Berhasil Mendapatkan Data Info Tani',
      kelompokTani
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: error.message
    });
  }
};

module.exports = {
  selectTani,
  selectKelompok,
  selectKelompokById
};
