// const { QueryTypes } = require('sequelize');
const { dataPerson, kelompok, tbl_akun, dataPetani, dataPenyuluh, sequelize } = require("../models");
// const { Op } = require('sequelize');
// const {Sequelize} = require('sequelize');
const {Sequelize, Op, literal, QueryTypes} = require('sequelize');
// import { sql } from '@sequelize/core';
// const { Op, literal } = require('sequelize');


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


const userVerify = async (req, res) => {
  try {
    // const data = await tbl_akun.findAll({
    //   attributes: [
    //     'nama',
    //     'no_wa',
    //     'email',
    //     // [
    //     //   literal('CASE WHEN datapenyuluhs.nik IS NULL THEN datapetanis.NIK ELSE datapenyuluhs.nik END'),
    //     //   'NIK',
    //     // ],
    //   ],
    //   where: {
    //     peran: {
    //       [Op.ne]: 'super admin',
    //     },
    //   },
    //   include: [
    //     {
    //       model: dataPetani,
    //       as: 'petani',
    //     },
    //     {
    //       model: dataPenyuluh,
    //       as: 'penyuluh',
    //     },
    //   ],
    // });
    const data = await sequelize.query(
      `SELECT
      a.id
      , a.nama
      , a.peran
      , a.no_wa
      , a.email
      , isVerified
      , CASE WHEN dp.nik IS NULL THEN p.NIK ELSE dp.nik END AS NIK
      FROM tbl_akun a
      LEFT JOIN datapenyuluhs dp ON a.accountID = dp.accountID
      LEFT JOIN datapetanis p ON a.accountID = p.accountID
      WHERE a.peran != 'super admin'`,
      {
        replacements: ['active'] ,
        type: QueryTypes.SELECT,

      }
    );

    if (!data) {
      throw new ApiError(404, 'Data tidak ditemukan');
    }

    res.status(200).json({
      message: 'Data berhasil diambil',
      data,
    });
  } catch (error) {
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

// create function to delete akun on tbl_akun
const deleteUser = async (req, res) => {
  const { id } = req.params;
  const { peran } = req.user;
  try {
    if (peran !== "super admin" && peran !== "admin") {
      throw new ApiError(400, "Anda tidak memiliki akses.");
    } else {
      const data = await tbl_akun.findOne({
        where: {
          id,
        },
      });
      if (!data) throw new ApiError(400, "data tidak ditemukan.");
      await tbl_akun.destroy({
        where: {
          id,
        },
      });
      const penyuluh = await dataPenyuluh.findOne({
        where: {
          accountID: data.accountID,
        },
      });
      if (!penyuluh){
        await dataPetani.destroy({
          where: {
            accountID: data.accountID,
          },
        });
      }else{
        await dataPenyuluh.destroy({
          where: {
            accountID: data.accountID,
          },
        });
      }
      res.status(200).json({
        message: "User Berhasil Di Hapus",
      });
    }
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: `gagal menghapus user, ${error.message}`,
    });
  }
};



module.exports = { usersAll, searchPoktan, searchPetani, userVerify, updateAccount, deleteUser };
