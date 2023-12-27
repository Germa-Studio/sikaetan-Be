const { dataPerson, kelompok, tbl_akun, dataPetani, dataPenyuluh } = require("../models");
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

const userVerify = async(req, res) => {
  try{
    const data = await tbl_akun.findAll();
    if(!data){
      throw new ApiError(404, "Data tidak ditemukan");
    }
    // data.status = "verified";
    // await data.save();
    res.status(200).json({
      message: "Data berhasil diambil",
      data,
    });
  }catch (error) {
    res.status(error.statusCode || 500).json({
      message: error.message,
    });
  }
};

const updateAccount = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await tbl_akun.findOne({ where: { id } });
    if (!user) throw new ApiError(400, "user tidak ditemukan");
    await tbl_akun.update(
      { isVerified: true },
      {
        where: {
          id,
        },
      }
    );
    // const users = await tblAkun.findOne({ where: { id } });
    return res.status(200).json({
      message: "User berhasil diverifikasi",
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
      include: [
        {
          model: kelompok,
          as: "kelompok"
        },
        {
          model: dataPenyuluh,
          as: "dataPenyuluh"
        }
      ],
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

module.exports = { usersAll, searchPoktan, searchPetani, userVerify, updateAccount };
