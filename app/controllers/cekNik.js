const {
  tanamanPetani,
  dataPenyuluh,
  kelompok,
  dataPetani,
  kecamatan,
  desa,
  kecamatanBinaan,
  desaBinaan
} = require('../models');
const ApiError = require('../../utils/ApiError');

const cekNik = async (req, res) => {
  try {
    const { NIK = '' } = req.body;

    const user = await dataPetani.findOne({
      where: { NIK },
      include: [
        { model: tanamanPetani },
        { model: kelompok },
        { model: kecamatan, as: 'kecamatanData' },
        { model: desa, as: 'desaData' }
      ]
    });
    if (!user) throw new ApiError(400, `data dengan NIK ${NIK} tidak ditemukan`);

    res.status(200).json({
      message: `data dengan NIK ${NIK} ditemukan`,
      user
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: error.message
    });
  }
};

const cekNiP = async (req, res) => {
  try {
    const { NIP = '' } = req.body;
    const user = await dataPenyuluh.findOne({
      where: { nik: NIP },
      include: [
        { model: kecamatan, as: 'kecamatanData' },
        { model: desa, as: 'desaData' },
        {
          model: kecamatanBinaan,
          as: 'kecamatanBinaanData',
          include: [
            {
              model: kecamatan
            }
          ]
        },
        {
          model: desaBinaan,
          as: 'desaBinaanData',
          include: [
            {
              model: desa,
              include: [
                {
                  model: kecamatan
                }
              ]
            }
          ]
        }
      ]
    });
    if (!user) throw new ApiError(400, `data dengan NIP ${NIP} tidak ditemukan`);

    res.status(200).json({
      message: `data dengan NIP ${NIP} ditemukan`,
      user
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: error.message
    });
  }
};

module.exports = { cekNik, cekNiP };
