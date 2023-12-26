const { dataPerson, kelompok, dataPetani } = require("../models");
const { Op } = require("sequelize");

const usersAll = async (req, res) => {
  try {
    const data = await dataPerson.findAll();
    res.status(200).json({
      message: "Data semua users berhasil di peroleh",
      tani: data,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: error.message,
    });
  }
};

const searchPoktan = async (req, res) => {
  const { search } = req.query;
  try {
    const data = await kelompok.findAll({
      where: {
        [Op.or]: [
          {
            gapoktan: {
              [Op.like]: `%${search}%`,
            },
          },
          {
            namaKelompok: {
              [Op.like]: `%${search}%`,
            },
          },
        ],
      },
      limit: 10,
    });
    res.status(200).json({
      message: "Data semua users berhasil di peroleh",
      data,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: error.message,
    });
  }
};

const searchPetani = async (req, res) => {
  const { search } = req.query;
  try {
    const data = await dataPetani.findAll({
      where: {
        [Op.or]: [
          {
            nik: {
              [Op.like]: `%${search}%`,
            },
          },
        ],
      },
      limit: 10,
    });
    res.status(200).json({
      message: "Data semua users berhasil di peroleh",
      data,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: error.message,
    });
  }
};

module.exports = { usersAll, searchPoktan, searchPetani };
