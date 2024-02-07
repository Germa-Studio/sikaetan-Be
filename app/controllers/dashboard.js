const { tbl_akun } = require("../models");
const { beritaTani } = require("../models");

const getDashboardIndexData = async (req, res) => {
  try {
    const verifiedPetani = await tbl_akun.count({
      where: {
        peran: "petani",
        isVerified: 1,
      },
    });

    const unverifiedPetani = await tbl_akun.count({
      where: {
        peran: "petani",
        isVerified: 0,
      },
    });

    const berita = await beritaTani.count({
      where: {
        kategori: "berita",
      },
    });
    const artikel = await beritaTani.count({
      where: {
        kategori: "artikel",
      },
    });
    const tips = await beritaTani.count({
      where: {
        kategori: "tips",
      },
    });

    res.status(200).json({
      verifiedPetani,
      unverifiedPetani,
      berita,
      artikel,
      tips,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Error",
      error: err,
    });
  }
};

module.exports = {
  getDashboardIndexData,
};
