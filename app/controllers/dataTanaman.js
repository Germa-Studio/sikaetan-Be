const { dataTanaman, kelompok } = require("../models");
const ApiError = require("../../utils/ApiError");
const imageKit = require("../../midleware/imageKit");
const dotenv = require("dotenv");
const bcrypt = require("bcrypt");
dotenv.config();

const getAllDataTanaman = async (req, res) => {
  const { peran } = req.user || {};

  try {
    if (peran !== "admin" && peran !== "super admin" && peran !== "penyuluh") {
      throw new ApiError(403, "Anda tidak memiliki akses.");
    }

    const data = await dataTanaman.findAll({
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
