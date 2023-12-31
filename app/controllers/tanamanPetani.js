const { tanamanPetani, kelompok, dataPetani, dataPenyuluh } = require("../models");
const ApiError = require("../../utils/ApiError");
const imageKit = require("../../midleware/imageKit");
const dotenv = require("dotenv");
const bcrypt = require("bcrypt");
const { Op, Sequelize } = require("sequelize");

dotenv.config();

const getAllTanamanPetani = async (req, res) => {
  const { peran } = req.user || {};
  const { page = 1, limit = 10, petaniId } = req.query;

  try {
    if (peran !== "admin" && peran !== "super admin" && peran !== "penyuluh") {
      throw new ApiError(403, "Anda tidak memiliki akses.");
    }

    // Include petaniId in the query if it's provided
    const query = {
      include: [
        {
          model: dataPetani,
          as: "dataPetani",
        },
      ],
      offset: (page - 1) * limit,
      limit: parseInt(limit),
    };

    if (petaniId) {
      query.where = { fk_petaniId: petaniId };
    }

    const data = await tanamanPetani.findAll(query);

    res.status(200).json({
      message: "Data berhasil didapatkan.",
      data,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: error.message,
    });
  }
};

const getTanamanPetaniById = async (req, res) => {
  const { id } = req.params;
  const { peran } = req.user || {};

  try {
    if (peran !== "admin" && peran !== "super admin" && peran !== "penyuluh") {
      throw new ApiError(403, "Anda tidak memiliki akses.");
    }

    const data = await tanamanPetani.findOne({
      where: { id },
      include: [
        {
          model: dataPetani,
          as: "dataPetani",
        }
      ],
    });

    res.status(200).json({
      message: "Data berhasil didapatkan.",
      data,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: error.message,
    });
  }
}

const tambahDataTanamanPetani = async (req, res) => {
  // Validate request body
  const { peran } = req.user || {};
  
  try{
    if (peran !== "admin" && peran !== "super admin" && peran !== "penyuluh") {
      throw new ApiError(403, "Anda tidak memiliki akses.");
    }
    const{
      statusKepemilikanLahan
      , luasLahan
      , kategori
      , jenis
      , komoditas
      , periodeMusimTanam
      , periodeBulanTanam
      , prakiraanLuasPanen
      , prakiraanProduksiPanen
      , prakiraanBulanPanen
      , fk_petaniId
    } = req.body;
    console.log({statusKepemilikanLahan})
    if (!statusKepemilikanLahan) throw new ApiError(400, "Status Tanah tidak boleh kosong");
    if (!kategori) throw new ApiError(400, "Kategori tidak boleh kosong.");
    if (!komoditas) throw new ApiError(400, "Komoditas tidak boleh kosong.");
    if (!periodeBulanTanam)
      throw new ApiError(400, "Periode tanam tidak boleh kosong.");
    if (!periodeMusimTanam)
      throw new ApiError(400, "Periode tanam tidak boleh kosong.");
    if (!luasLahan) throw new ApiError(400, "Luas lahan tidak boleh kosong.");
    if (!prakiraanLuasPanen)
      throw new ApiError(400, "Prakiraan luas panen tidak boleh kosong.");
    if (!prakiraanProduksiPanen)
      throw new ApiError(400, "Prakiraan hasil panen tidak boleh kosong.");
    if (!prakiraanBulanPanen)
      throw new ApiError(400, "Prakiraan bulan panen tidak boleh kosong.");
    if (!fk_petaniId) throw new ApiError(400, "Kelompok tidak boleh kosong.");

    const Petani = await dataPetani.findOne({
      where: { id: fk_petaniId },
    })
    if (!Petani) throw new ApiError(400, "Data Petani tidak ditemukan")

    const data = await tanamanPetani.create({
      statusKepemilikanLahan
      , luasLahan
      , kategori
      , jenis
      , komoditas
      , periodeMusimTanam
      , periodeBulanTanam
      , prakiraanLuasPanen
      , prakiraanProduksiPanen
      , prakiraanBulanPanen
      , fk_petaniId
    });

    res.status(200).json({
      message: "Data berhasil ditambahkan.",
      data,
    });
  } catch (error){
    res.status(error.statusCode || 500).json({
      message: error.message,
    });
  }
};

const deleteDatatanamanPetani = async(req, res) => {
  const { id } = req.params;
  const { peran } = req.user || {};

  try{
    if (peran !== "admin" && peran !== "super admin" && peran !== "penyuluh") {
      throw new ApiError(403, "Anda tidak memiliki akses.");
    }
    const data = await tanamanPetani.destroy({
      where: { id },
    });

    res.status(200).json({
      message: "Data berhasil dihapus.",
      data,
    });
  } catch (error){
    res.status(error.statusCode || 500).json({
      message: error.message,
    });
  }
}

const getTanamanPetaniStatistically = async (req, res) => {
  const { month, year, lineType, pieType } = req.query;
  try {
    const lineChartType = lineType || "komoditas";
    const pieChartType = pieType || "komoditas";
    const date_starts = new Date(`${year}-${month}-01`)
    let date_ends = new Date(`${year}-${month}-31`)
    date_ends = new Date(date_ends.setDate(date_ends.getDate() + 1))
    const lineChart = await tanamanPetani.findAll({
      attributes: [
        [Sequelize.fn("DATE", Sequelize.col("createdAt")), "date"],
        lineChartType,
        [Sequelize.fn("COUNT", Sequelize.col(lineChartType)), "count"],
      ],
      group: [lineChartType, Sequelize.fn("DATE", Sequelize.col("createdAt"))],
      where: {
        createdAt: {
          [Op.between]: [
            date_starts,
            date_ends
          ],
        },
      },
      order: [[Sequelize.col("createdAt"), "ASC"]],
    });
    const pieChart = await tanamanPetani.findAll({
      attributes: [
        pieChartType,
        [Sequelize.fn("COUNT", Sequelize.col(pieChartType)), "count"],
      ],
      group: [pieChartType],
      where: {
        createdAt: {
          [Op.between]: [
            date_starts,
            date_ends
          ],
        },
      },
    });
    const latest = await tanamanPetani.findAll({
      order: [[Sequelize.col("createdAt"), "DESC"]],
      limit: 5,
    });
    res.status(200).json({
      message: "Data berhasil didapatkan.",
      data: {
        statistik: lineChart,
        summary: pieChart,
        latest,
      },
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: error.message,
    });
  }
};

const getDetailedDataTanamanPetani = async (req, res) => {
  const { id } = req.params;
  const { peran } = req.user || {};

  try {
    if (peran !== "admin" && peran !== "super admin" && peran !== "penyuluh") {
      throw new ApiError(403, "Anda tidak memiliki akses.");
    }

    const data = await tanamanPetani.findOne({
      where: { id },
      include: [
        {
          model: dataPetani,
          as: "dataPetani",
          include: [
            {
              model: kelompok,
              as: "kelompok",
            },
            {
              model: dataPenyuluh,
              as: "dataPenyuluh",
            },
          ],
        }
      ],
    });

    res.status(200).json({
      message: "Data berhasil didapatkan.",
      data,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: error.message,
    });
  }
};

const editDataTanamanPetani = async(req, res) => {
  const { id } = req.params;
  const { peran } = req.user || {};

  try{
    if (peran !== "admin" && peran !== "super admin" && peran !== "penyuluh") {
      throw new ApiError(403, "Anda tidak memiliki akses.");
    }
    const{
      statusKepemilikanLahan
      , luasLahan
      , kategori
      , jenis
      , komoditas
      , periodeMusimTanam
      , periodeBulanTanam
      , prakiraanLuasPanen
      , prakiraanProduksiPanen
      , prakiraanBulanPanen
      , fk_petaniId
    } = req.body;
    console.log({statusKepemilikanLahan})
    if (!statusKepemilikanLahan) throw new ApiError(400, "Status Tanah tidak boleh kosong");
    if (!kategori) throw new ApiError(400, "Kategori tidak boleh kosong.");
    if (!komoditas) throw new ApiError(400, "Komoditas tidak boleh kosong.");
    if (!periodeBulanTanam)
      throw new ApiError(400, "Periode tanam tidak boleh kosong.");
    if (!periodeMusimTanam)
      throw new ApiError(400, "Periode tanam tidak boleh kosong.");
    if (!luasLahan) throw new ApiError(400, "Luas lahan tidak boleh kosong.");
    if (!prakiraanLuasPanen)
      throw new ApiError(400, "Prakiraan luas panen tidak boleh kosong.");
    if (!prakiraanProduksiPanen)
      throw new ApiError(400, "Prakiraan hasil panen tidak boleh kosong.");
    if (!prakiraanBulanPanen)
      throw new ApiError(400, "Prakiraan bulan panen tidak boleh kosong.");
    if (!fk_petaniId) throw new ApiError(400, "Kelompok tidak boleh kosong.");

    const Petani = await dataPetani.findOne({
      where: { id: fk_petaniId },
    })
    if (!Petani) throw new ApiError(400, "Data Petani tidak ditemukan")

    const data = await tanamanPetani.update({
      statusKepemilikanLahan
      , luasLahan
      , kategori
      , jenis
      , komoditas
      , periodeMusimTanam
      , periodeBulanTanam
      , prakiraanLuasPanen
      , prakiraanProduksiPanen
      , prakiraanBulanPanen
      , fk_petaniId
    },
    {where: {id}});

    res.status(200).json({
      message: "Data berhasil diupdate.",
      data,
    });
  } catch (error){
    res.status(error.statusCode || 500).json({
      message: error.message,
    });
  }
};


module.exports = {
  getAllTanamanPetani,
  tambahDataTanamanPetani,
  getTanamanPetaniStatistically,
  editDataTanamanPetani,
  deleteDatatanamanPetani,
  getDetailedDataTanamanPetani,
};