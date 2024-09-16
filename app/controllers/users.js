const ApiError = require('../../utils/ApiError');
const {
  dataPerson,
  kelompok,
  tbl_akun,
  dataPetani,
  dataPenyuluh,
  kecamatan,
  desa
} = require('../models');
const { Op } = require('sequelize');

const usersAll = async (req, res) => {
  const { peran } = req.user || {};
  const { page, limit } = req.query;
  try {
    if (peran === null) {
      throw new ApiError(403, 'Anda tidak memiliki akses.');
    } else {
      const limitFilter = Number(limit) || 10;
      const pageFilter = Number(page) || 1;

      const query = {
        limit: limitFilter,
        offset: (pageFilter - 1) * limitFilter
      };
      const data = await dataPerson.findAll({ ...query });
      const total = await dataPerson.count({ ...query });
      res.status(200).json({
        message: 'Data User Berhasil Diperoleh',
        data,
        total,
        currentPages: page,
        limit: limitFilter,
        maxPages: Math.ceil(total / (limitFilter || 10)),
        from: pageFilter ? (pageFilter - 1) * limitFilter + 1 : 1,
        to: pageFilter ? (pageFilter - 1) * limitFilter + data.length : data.length
      });
    }
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: error.message
    });
  }
};

const userVerify = async (req, res) => {
  const { page, limit, verified } = req.query;
  const { peran } = req.user || {};

  const orderFilter = !['true', 'false'].includes(verified)
    ? [['id', 'ASC']]
    : [
        ['isVerified', verified === 'true' ? 'DESC' : 'ASC'],
        ['id', 'ASC']
      ];

  console.log(orderFilter);

  try {
    // Check if the user has restricted roles
    if (peran === 'petani' || peran === 'penyuluh' || peran === 'operator poktan') {
      throw new ApiError(403, 'Anda tidak memiliki akses.');
    }

    // Build the query with pagination
    const query = {
      include: [
        {
          model: dataPetani,
          required: true,
          attributes: ['NIK']
        }
      ],
      where: {
        peran: {
          [Op.not]: 'super admin'
        }
      },
      attributes: ['id', 'nama', 'peran', 'no_wa', 'email', 'isVerified'],
      order: orderFilter,
      limit: Number(limit),
      offset: (Number(page) - 1) * Number(limit)
    };

    // Fetch the data using Sequelize
    const data = await tbl_akun.findAll(query);
    const total = await tbl_akun.count(query);

    if (data.length === 0) {
      throw new ApiError(404, 'Data tidak ditemukan');
    }

    // Respond with the data
    res.status(200).json({
      message: 'Data berhasil diambil',
      data,
      total,
      currentPages: Number(page),
      limit: Number(limit),
      maxPages: Math.ceil(total / Number(limit)),
      from: Number(page) ? (Number(page) - 1) * Number(limit) + 1 : 1,
      to: Number(page) ? (Number(page) - 1) * Number(limit) + data.length : data.length
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: error.message
    });
  }
};

const updateAccount = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await tbl_akun.findOne({ where: { id } });
    if (!user) throw new ApiError(400, 'user tidak ditemukan');
    await tbl_akun.update(
      { isVerified: true },
      {
        where: {
          id
        }
      }
    );
    // const users = await tblAkun.findOne({ where: { id } });
    return res.status(200).json({
      message: 'User berhasil diverifikasi'
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: error.message
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
              [Op.like]: `%${search}%`
            }
          },
          {
            namaKelompok: {
              [Op.like]: `%${search}%`
            }
          }
        ]
      },
      limit: 10,
      include: [
        {
          model: kecamatan,
          as: 'kecamatanData'
        },
        {
          model: desa,
          as: 'desaData'
        }
      ]
    });
    res.status(200).json({
      message: 'Data semua users berhasil di peroleh',
      data
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: error.message
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
              [Op.like]: `%${search}%`
            }
          }
        ]
      },
      include: [
        {
          model: kelompok,
          as: 'kelompok'
        },
        {
          model: dataPenyuluh,
          as: 'dataPenyuluh'
        },
        {
          model: kecamatan,
          as: 'kecamatanData'
        },
        {
          model: desa,
          as: 'desaData'
        }
      ],
      limit: 10
    });
    res.status(200).json({
      message: 'Data semua users berhasil di peroleh',
      data
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: error.message
    });
  }
};

// create function to delete akun on tbl_akun
const deleteUser = async (req, res) => {
  const { id } = req.params;
  const { peran } = req.user;
  try {
    if (peran !== 'super admin' && peran !== 'admin') {
      throw new ApiError(403, 'Anda tidak memiliki akses.');
    } else {
      const data = await tbl_akun.findOne({
        where: {
          id
        }
      });
      if (!data) throw new ApiError(400, 'data tidak ditemukan.');
      await tbl_akun.destroy({
        where: {
          id
        }
      });
      const penyuluh = await dataPenyuluh.findOne({
        where: {
          accountID: data.accountID
        }
      });
      if (!penyuluh) {
        await dataPetani.destroy({
          where: {
            accountID: data.accountID
          }
        });
      } else {
        await dataPenyuluh.destroy({
          where: {
            accountID: data.accountID
          }
        });
      }
      res.status(200).json({
        message: 'User Berhasil Di Hapus'
      });
    }
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: `gagal menghapus user, ${error.message}`
    });
  }
};

module.exports = {
  usersAll,
  searchPoktan,
  searchPetani,
  userVerify,
  updateAccount,
  deleteUser
};
