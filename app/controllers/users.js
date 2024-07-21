// const { QueryTypes } = require('sequelize');
const { dataPerson, kelompok, tbl_akun, dataPetani, dataPenyuluh, sequelize } = require("../models");
// const { Op } = require('sequelize');
// const {Sequelize} = require('sequelize');
const {Sequelize, Op, literal, QueryTypes} = require('sequelize');
// const { QueryTypes } = require('sequelize'); // Ensure you have this import
// import { sql } from '@sequelize/core';
// const { Op, literal } = require('sequelize');


const usersAll = async (req, res) => {
  const { peran } = req.user || {};
	const { page, limit } = req.query;
	try {
		if (peran === NULL) {
			throw new ApiError(400, "Anda tidak memiliki akses.");
		} else {
			const limitFilter = Number(limit) || 10;
			const pageFilter = Number(page) || 1;

			const query = {
				limit: limitFilter,
				offset: (pageFilter - 1) * limitFilter,
				limit: parseInt(limit),
			};
			const data = await dataPerson.findAll({ ...query });
			const total = await dataPerson.count({ ...query });
			res.status(200).json({
				message: "Data User Berhasil Diperoleh",
				data,
				total,
				currentPages: page,
				limit: Number(limit),
				maxPages: Math.ceil(total / (Number(limit) || 10)),
				from: Number(page) ? (Number(page) - 1) * Number(limit) + 1 : 1,
				to: Number(page)
					? (Number(page) - 1) * Number(limit) + data.length
					: data.length,
			});
		}
    } catch (error) {
        res.status(error.statusCode || 500).json({
            message: error.message,
        });
    }
};



const userVerify = async (req, res) => {
  try {
    const { peran } = req.user;
    const { page = 1, limit = 10 } = req.query; // Default values for page and limit
    const limitFilter = parseInt(limit, 10);
    const offset = (parseInt(page, 10) - 1) * limitFilter;

    // Count the total number of records
    const totalRecordsQuery = `SELECT COUNT(*) AS total FROM tbl_akun a
      RIGHT JOIN dataPetanis p ON a.accountID = p.accountID
      WHERE a.peran != 'super admin'`;

    const totalRecordsResult = await sequelize.query(totalRecordsQuery, {
      type: QueryTypes.SELECT,
    });
    const totalRecords = totalRecordsResult[0].total;

    const dataQuery = `SELECT
      a.id,
      a.nama,
      a.peran,
      a.no_wa,
      a.email,
      isVerified,
      p.NIK
      FROM tbl_akun a
      RIGHT JOIN dataPetanis p ON a.accountID = p.accountID
      WHERE a.peran != 'super admin'
      LIMIT :limit OFFSET :offset`;

    const data = await sequelize.query(dataQuery, {
      replacements: { limit: limitFilter, offset: offset },
      type: QueryTypes.SELECT,
    });

    if (!data) {
      throw new ApiError(404, 'Data tidak ditemukan');
    }

    res.status(200).json({
      message: 'Data berhasil diambil',
      data,
      totalRecords,
      currentPage: parseInt(page, 10),
      totalPages: Math.ceil(totalRecords / limitFilter),
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
