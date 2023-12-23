const { dataTanaman, kelompok } = require("../models");

const ApiError = require("../../utils/ApiError");
const dotenv = require("dotenv");
const { Op } = require("sequelize");

dotenv.config();

const getAllDataTanaman = async (req, res) => {
  const { peran } = req.user || {};
  const { limit, page, sortBy, sortType, search } = req.query;

  try {
    if (peran !== "admin" && peran !== "super admin" && peran !== "penyuluh") {
      throw new ApiError(403, "Anda tidak memiliki akses.");
    }

    const limitFilter = Number(limit) || 10;
    const pageFilter = Number(page) || 1;

    const data = await dataTanaman.findAll({
      include: [
        {
          model: kelompok,
          as: "kelompok",
        },
      ],
      limit: limitFilter,
      offset: (pageFilter - 1) * limitFilter,
      order: [[sortBy || "id", sortType || "ASC"]],
    });
    const total = await dataTanaman.count({
      where: {
        kategori: {
          [Op.like]: `%${search}%`,
        },
      },
    });

    res.status(200).json({
      message: "Data berhasil didapatkan.",
      data: {
        data,
        total,
        currentPages: Number(page) || 1,
        limit: Number(limit) || 10,
        maxPages: Math.ceil(total / (Number(limit) || 10)),
        from: Number(page) ? (Number(page) - 1) * Number(limit) + 1 : 1,
        to: Number(page)
          ? (Number(page) - 1) * Number(limit) + data.length
          : data.length,
        sortBy: sortBy || "id",
        sortType: sortType || "ASC",
      },
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: error.message,
    });
  }
};

const getDetailedDataTanaman = async (req, res) => {
  const { id } = req.params;
  const { peran } = req.user || {};

  try {
    if (peran !== "admin" && peran !== "super admin" && peran !== "penyuluh") {
      throw new ApiError(403, "Anda tidak memiliki akses.");
    }

    const data = await dataTanaman.findOne({
      where: { id },
      include: [
        {
          model: kelompok,
          as: "kelompok",
        },
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

const tambahDataTanaman = async (req, res) => {
  const { peran } = req.user || {};

  try {
    if (peran !== "admin" && peran !== "super admin" && peran !== "penyuluh") {
      throw new ApiError(403, "Anda tidak memiliki akses.");
    }
    const {
      kategori,
      komoditas,
      periodeTanam,
      luasLahan,
      prakiraanLuasPanen,
      prakiraanHasilPanen,
      prakiraanBulanPanen,
      fk_kelompokId,
    } = req.body;

    if (!kategori) throw new ApiError(400, "Kategori tidak boleh kosong.");
    if (!komoditas) throw new ApiError(400, "Komoditas tidak boleh kosong.");
    if (!periodeTanam)
      throw new ApiError(400, "Periode tanam tidak boleh kosong.");
    if (!luasLahan) throw new ApiError(400, "Luas lahan tidak boleh kosong.");
    if (!prakiraanLuasPanen)
      throw new ApiError(400, "Prakiraan luas panen tidak boleh kosong.");
    if (!prakiraanHasilPanen)
      throw new ApiError(400, "Prakiraan hasil panen tidak boleh kosong.");
    if (!prakiraanBulanPanen)
      throw new ApiError(400, "Prakiraan bulan panen tidak boleh kosong.");
    if (!fk_kelompokId) throw new ApiError(400, "Kelompok tidak boleh kosong.");

    const kelompokTani = await kelompok.findOne({
      where: { id: fk_kelompokId },
    });
    if (!kelompokTani) throw new ApiError(400, "Kelompok tidak ditemukan.");

    const data = await dataTanaman.create({
      kategori,
      komoditas,
      periodeTanam,
      luasLahan,
      prakiraanLuasPanen,
      prakiraanHasilPanen,
      prakiraanBulanPanen,
      fk_kelompokId,
    });

    res.status(201).json({
      message: "Data berhasil ditambahkan.",
      data,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: error.message,
    });
  }
};

const editDataTanaman = async (req, res) => {
  const { id } = req.params;
  const { peran } = req.user || {};

  try {
    if (peran !== "admin" && peran !== "super admin" && peran !== "penyuluh") {
      throw new ApiError(403, "Anda tidak memiliki akses.");
    }
    const {
      kategori,
      komoditas,
      periodeTanam,
      luasLahan,
      prakiraanLuasPanen,
      prakiraanHasilPanen,
      prakiraanBulanPanen,
      fk_kelompokId,
    } = req.body;

    if (!kategori) throw new ApiError(400, "Kategori tidak boleh kosong.");
    if (!komoditas) throw new ApiError(400, "Komoditas tidak boleh kosong.");
    if (!periodeTanam)
      throw new ApiError(400, "Periode tanam tidak boleh kosong.");
    if (!luasLahan) throw new ApiError(400, "Luas lahan tidak boleh kosong.");
    if (!prakiraanLuasPanen)
      throw new ApiError(400, "Prakiraan luas panen tidak boleh kosong.");
    if (!prakiraanHasilPanen)
      throw new ApiError(400, "Prakiraan hasil panen tidak boleh kosong.");
    if (!prakiraanBulanPanen)
      throw new ApiError(400, "Prakiraan bulan panen tidak boleh kosong.");
    if (!fk_kelompokId) throw new ApiError(400, "Kelompok tidak boleh kosong.");

    const kelompokTani = await kelompok.findOne({
      where: { id: fk_kelompokId },
    });
    if (!kelompokTani) throw new ApiError(400, "Kelompok tidak ditemukan.");

    await dataTanaman.update(
      {
        kategori,
        komoditas,
        periodeTanam,
        luasLahan,
        prakiraanLuasPanen,
        prakiraanHasilPanen,
        prakiraanBulanPanen,
        fk_kelompokId,
      },
      { where: { id } }
    );

    res.status(201).json({
      message: "Data berhasil diupdate.",
      data: req.body,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: error.message,
    });
  }
};

const hapusDataTanaman = async (req, res) => {
  const { id } = req.params;
  const { peran } = req.user || {};

  try {
    if (peran !== "admin" && peran !== "super admin" && peran !== "penyuluh") {
      throw new ApiError(403, "Anda tidak memiliki akses.");
    }

    await dataTanaman.destroy({
      where: { id },
    });

    res.status(200).json({
      message: "Data berhasil dihapus.",
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: error.message,
    });
  }
};

module.exports = {
  tambahDataTanaman,
  getAllDataTanaman,
  getDetailedDataTanaman,
  editDataTanaman,
  hapusDataTanaman,
};
