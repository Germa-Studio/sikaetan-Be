const { tbl_akun, dataPetani, beritaTani } = require('../models');

const getDashboardIndexData = async (req, res) => {
  try {
    const verifiedPetani = await dataPetani.count({
      include: [
        {
          model: tbl_akun
        }
      ],
      where: {
        '$tbl_akun.isVerified$': 1
      }
    });

    const unverifiedPetani = await dataPetani.count({
      include: [
        {
          model: tbl_akun
        }
      ],
      where: {
        '$tbl_akun.isVerified$': 0
      }
    });

    const berita = await beritaTani.count({
      where: {
        kategori: 'berita'
      }
    });
    const artikel = await beritaTani.count({
      where: {
        kategori: 'artikel'
      }
    });
    const tips = await beritaTani.count({
      where: {
        kategori: 'tips'
      }
    });

    res.status(200).json({
      verifiedPetani,
      unverifiedPetani,
      berita,
      artikel,
      tips
    });
  } catch (err) {
    res.status(500).json({
      message: 'Error',
      error: err
    });
  }
};

module.exports = {
  getDashboardIndexData
};
