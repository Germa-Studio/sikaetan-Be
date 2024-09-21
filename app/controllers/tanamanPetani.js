const {
  tanamanPetani,
  kelompok,
  dataPetani,
  dataPenyuluh,
  dataTanaman,
  kecamatan,
  desa
} = require('../models');
const ApiError = require('../../utils/ApiError');
const dotenv = require('dotenv');
const { Op, Sequelize, literal } = require('sequelize');
const ExcelJS = require('exceljs');
const moment = require('moment');
const monthOrder = require('../../utils/constants/months');

dotenv.config();

const getAllTanamanPetani = async (req, res) => {
  const { peran } = req.user || {};
  const { page, limit, petaniId, isExport } = req.query;

  try {
    if (peran === 'petani') {
      throw new ApiError(403, 'Anda tidak memiliki akses.');
    }

    // Include petaniId in the query if it's provided
    const limitFilter = Number(limit);
    const pageFilter = Number(page);
    const isExportFilter = Boolean(isExport);

    const query = {
      include: [
        {
          model: dataPetani,
          as: 'dataPetani'
        }
      ],
      limit: limitFilter,
      offset: (pageFilter - 1) * limitFilter
      // limit: parseInt(limit),
    };

    if (petaniId) {
      query.where = { fk_petaniId: petaniId };
    }

    const data = await tanamanPetani.findAll(
      isExportFilter
        ? {
            include: [
              {
                model: dataPetani,
                as: 'dataPetani',
                include: [
                  {
                    model: kelompok
                  },
                  {
                    model: kecamatan,
                    as: 'kecamatanData'
                  },
                  {
                    model: desa,
                    as: 'desaData'
                  }
                ]
              }
            ]
          }
        : { ...query }
    );
    const total = await tanamanPetani.count({ ...query });
    // { ...query } can be replaced with 'query' since it's the same object and don't need to be spread using '...'

    res.status(200).json({
      message: 'Data berhasil didapatkan.',
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

const getTopTanamanPetani = async (req, res) => {
  const { page, limit } = req.query;
  try {
    const limitFilter = Number(limit) || 10;
    const pageFilter = Number(page) || 1;

    const whereQuery = {
      createdAt: {
        [Op.gte]: moment().subtract(30, 'days').toDate()
      }
    };

    const query = {
      limit: 30,
      order: [
        ['prakiraanProduksiPanen', 'DESC'],
        [literal(`FIELD(prakiraanBulanPanen, '${monthOrder.join("', '")}')`), 'ASC']
      ],
      where: whereQuery,
      include: [
        {
          model: dataPetani,
          as: 'dataPetani',
          include: [
            {
              model: kelompok,
              as: 'kelompok',
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
            },
            {
              model: kecamatan,
              as: 'kecamatanData'
            },
            {
              model: desa,
              as: 'desaData'
            }
          ]
        }
      ]
    };

    const data = await tanamanPetani.findAll(query);
    const total = await tanamanPetani.count({
      where: whereQuery
    });
    const limitedTotal = total > 30 ? 30 : total;
    const slicedData = data.slice((pageFilter - 1) * limitFilter, pageFilter * limitFilter);

    res.status(200).json({
      message: 'Berhasil mendapatkan data tanaman petani',
      data: slicedData,
      total: limitedTotal,
      currentPages: pageFilter,
      limit: limitFilter,
      maxPages: Math.ceil(limitedTotal / limitFilter),
      from: (pageFilter - 1) * limitFilter + 1,
      to: (pageFilter - 1) * limitFilter + data.length
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: error.message
    });
  }
};

const tambahDataTanamanPetani = async (req, res) => {
  // Validate request body
  // const { peran } = req.user || {};

  try {
    const {
      statusKepemilikanLahan,
      luasLahan,
      kategori,
      jenis,
      komoditas,
      periodeMusimTanam,
      periodeBulanTanam,
      prakiraanLuasPanen,
      prakiraanProduksiPanen,
      prakiraanBulanPanen,
      fk_petaniId
    } = req.body;
    if (!statusKepemilikanLahan) throw new ApiError(400, 'Status Tanah tidak boleh kosong');
    if (!kategori) throw new ApiError(400, 'Kategori tidak boleh kosong.');
    if (!komoditas) throw new ApiError(400, 'Komoditas tidak boleh kosong.');
    if (!periodeBulanTanam) throw new ApiError(400, 'Periode tanam tidak boleh kosong.');
    if (!periodeMusimTanam) throw new ApiError(400, 'Periode tanam tidak boleh kosong.');
    if (!luasLahan) throw new ApiError(400, 'Luas lahan tidak boleh kosong.');
    if (!prakiraanLuasPanen) throw new ApiError(400, 'Prakiraan luas panen tidak boleh kosong.');
    if (!prakiraanProduksiPanen)
      throw new ApiError(400, 'Prakiraan hasil panen tidak boleh kosong.');
    if (!prakiraanBulanPanen) throw new ApiError(400, 'Prakiraan bulan panen tidak boleh kosong.');
    if (!fk_petaniId) throw new ApiError(400, 'Kelompok tidak boleh kosong.');

    const Petani = await dataPetani.findOne({
      where: { id: fk_petaniId }
    });
    if (!Petani) throw new ApiError(400, 'Data Petani tidak ditemukan');

    const data = await tanamanPetani.create({
      statusKepemilikanLahan,
      luasLahan,
      kategori,
      jenis,
      komoditas,
      periodeMusimTanam,
      periodeBulanTanam,
      prakiraanLuasPanen,
      prakiraanProduksiPanen,
      prakiraanBulanPanen,
      fk_petaniId
    });

    res.status(200).json({
      message: 'Data berhasil ditambahkan.',
      data
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: error.message
    });
  }
};

const deleteDatatanamanPetani = async (req, res) => {
  const { id } = req.params;
  const { peran } = req.user || {};

  try {
    if (peran !== 'operator super admin') {
      throw new ApiError(403, 'Anda tidak memiliki akses.');
    }
    const data = await tanamanPetani.destroy({
      where: { id }
    });

    res.status(200).json({
      message: 'Data berhasil dihapus.',
      data
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: error.message
    });
  }
};

const getTanamanPetaniStatistically = async (req, res) => {
  const { month, year, lineType, pieType } = req.query;
  try {
    const lineChartType = lineType || 'komoditas';
    const pieChartType = pieType || 'komoditas';
    const date_starts = new Date(`${year}-${month}-01`);
    let date_ends = new Date(`${year}-${month}-31`);
    date_ends = new Date(date_ends.setDate(date_ends.getDate() + 1));
    const lineChart = await dataTanaman.findAll({
      attributes: [
        [Sequelize.fn('DATE', Sequelize.col('createdAt')), 'date'],
        lineChartType,
        [Sequelize.fn('COUNT', Sequelize.col(lineChartType)), 'count']
      ],
      group: [lineChartType, Sequelize.fn('DATE', Sequelize.col('createdAt'))],
      where: {
        [lineChartType]: {
          [Op.not]: null
        },
        createdAt: {
          [Op.between]: [date_starts, date_ends]
        }
      },
      order: [[Sequelize.col('createdAt'), 'ASC']]
    });
    const pieChart = await dataTanaman.findAll({
      attributes: [pieChartType, [Sequelize.fn('COUNT', Sequelize.col(pieChartType)), 'count']],
      group: [pieChartType],
      where: {
        [pieChartType]: {
          [Op.not]: null
        },
        createdAt: {
          [Op.between]: [date_starts, date_ends]
        }
      }
    });
    const latest = await tanamanPetani.findAll({
      include: [
        {
          model: dataPetani,
          as: 'dataPetani',
          include: [
            {
              model: kelompok,
              as: 'kelompok'
            }
          ]
        }
      ],
      order: [[Sequelize.col('createdAt'), 'DESC']],
      limit: 5
    });
    res.status(200).json({
      message: 'Data berhasil didapatkan.',
      data: {
        statistik: lineChart,
        summary: pieChart,
        latest
      }
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: error.message
    });
  }
};

const getAllTanamanPetaniByPetani = async (req, res) => {
  const { id } = req.params;
  const { peran, accountID } = req.user || {};
  const { page, limit } = req.query;

  try {
    if (!['petani', 'operator super admin', 'penyuluh'].includes(peran)) {
      throw new ApiError(403, 'Anda tidak memiliki akses.');
    }

    const petani = await dataPetani.findOne({
      where: { id }
    });

    if (!petani) {
      throw new ApiError(404, 'Petani tidak ditemukan.');
    }

    if (peran === 'penyuluh') {
      const penyuluh = await dataPenyuluh.findOne({
        where: { accountID }
      });

      if (petani.fk_penyuluhId !== penyuluh.id) {
        throw new ApiError(403, 'Anda tidak memiliki akses.');
      }
    }

    const limitFilter = limit ? Number(limit) : 10;
    const pageFilter = page ? Number(page) : 1;

    const query = {
      where: { fk_petaniId: id },
      limit: limitFilter,
      offset: (pageFilter - 1) * limitFilter
    };

    const data = await tanamanPetani.findAll({
      ...query,
      order: [['createdAt', 'DESC']]
    });
    const total = await tanamanPetani.count({ ...query });

    res.status(200).json({
      message: 'Data berhasil didapatkan.',
      data,
      total,
      currentPages: pageFilter,
      limit: limitFilter,
      maxPages: Math.ceil(total / limitFilter),
      from: pageFilter ? (pageFilter - 1) * limitFilter + 1 : 1,
      to: pageFilter ? (pageFilter - 1) * limitFilter + data.length : data.length
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: error.message
    });
  }
};

const getTanamanbyPetani = async (req, res) => {
  const { id } = req.params;
  const { peran, accountID } = req.user || {};
  const { jenis, musim, tipe, startDate, endDate } = req.query;

  try {
    if (!['petani', 'operator super admin', 'penyuluh'].includes(peran)) {
      throw new ApiError(403, 'Anda tidak memiliki akses.');
    }

    const petani = await dataPetani.findOne({
      where: { id }
    });

    if (!petani) {
      throw new ApiError(404, 'Petani tidak ditemukan.');
    }

    if (peran === 'penyuluh') {
      const penyuluh = await dataPenyuluh.findOne({
        where: { accountID }
      });

      if (petani.fk_penyuluhId !== penyuluh.id) {
        throw new ApiError(403, 'Anda tidak memiliki akses.');
      }
    }

    const filter = {
      fk_petaniId: id
    };

    if (jenis) {
      filter.jenis = {
        [Op.like]: `%${jenis}%`
      };
    }

    if (musim) {
      filter.periodeMusimTanam = {
        [Op.like]: `%${musim}%`
      };
    }

    if (tipe) {
      filter.kategori = {
        [Op.like]: `%${tipe}%`
      };
    }

    if (startDate && endDate) {
      filter.createdAt = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    }

    const data = await tanamanPetani.findAll({
      attributes: [
        'komoditas',
        'periodeMusimTanam',
        'jenis',
        'kategori',
        [Sequelize.fn('COUNT', Sequelize.col('komoditas')), 'count']
      ],
      where: filter,
      group: ['komoditas']
    });

    res.status(200).json({
      message: 'Data berhasil didapatkan.',
      data
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: error.message
    });
  }
};

const getAllTanamanPetaniByPenyuluh = async (req, res) => {
  const { peran, accountID } = req.user || {};
  const { page, limit } = req.query;

  try {
    if (!['operator super admin', 'penyuluh'].includes(peran)) {
      throw new ApiError(403, 'Anda tidak memiliki akses.');
    }

    const penyuluh = await dataPenyuluh.findOne({
      where: { accountID }
    });

    const petanis = await dataPetani.findAll({
      where: { fk_penyuluhId: penyuluh.id }
    });

    const petaniIds = petanis.map((petani) => petani.id);

    const limitFilter = limit ? Number(limit) : 10;
    const pageFilter = page ? Number(page) : 1;

    console.log({ petaniIds });

    const query = {
      where: {
        fk_petaniId: {
          [Op.in]: petaniIds
        }
      },
      limit: limitFilter,
      offset: (pageFilter - 1) * limitFilter
    };

    const data = await tanamanPetani.findAll({
      ...query,
      order: [['createdAt', 'DESC']]
    });
    const total = await tanamanPetani.count({ ...query });

    res.status(200).json({
      message: 'Data berhasil didapatkan.',
      data,
      total,
      currentPages: pageFilter,
      limit: limitFilter,
      maxPages: Math.ceil(total / limitFilter),
      from: pageFilter ? (pageFilter - 1) * limitFilter + 1 : 1,
      to: pageFilter ? (pageFilter - 1) * limitFilter + data.length : data.length
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: error.message
    });
  }
};

const getDetailedDataTanamanPetani = async (req, res) => {
  const { id } = req.params;
  const { peran } = req.user || {};

  try {
    if (peran === 'petani') {
      throw new ApiError(403, 'Anda tidak memiliki akses.');
    }

    const data = await tanamanPetani.findOne({
      where: { id },
      include: [
        {
          model: dataPetani,
          as: 'dataPetani',
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
          ]
        }
      ]
    });

    res.status(200).json({
      message: 'Data berhasil didapatkan.',
      data
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: error.message
    });
  }
};

const editDataTanamanPetani = async (req, res) => {
  const { id } = req.params;
  const { peran } = req.user || {};

  try {
    if (peran === 'petani') {
      throw new ApiError(403, 'Anda tidak memiliki akses.');
    }
    const {
      statusKepemilikanLahan,
      luasLahan,
      kategori,
      jenis,
      komoditas,
      periodeMusimTanam,
      periodeBulanTanam,
      prakiraanLuasPanen,
      prakiraanProduksiPanen,
      prakiraanBulanPanen,
      fk_petaniId
    } = req.body;
    if (!statusKepemilikanLahan) throw new ApiError(400, 'Status Tanah tidak boleh kosong');
    if (!kategori) throw new ApiError(400, 'Kategori tidak boleh kosong.');
    if (!komoditas) throw new ApiError(400, 'Komoditas tidak boleh kosong.');
    if (!periodeBulanTanam) throw new ApiError(400, 'Periode tanam tidak boleh kosong.');
    if (!periodeMusimTanam) throw new ApiError(400, 'Periode tanam tidak boleh kosong.');
    if (!luasLahan) throw new ApiError(400, 'Luas lahan tidak boleh kosong.');
    if (!prakiraanLuasPanen) throw new ApiError(400, 'Prakiraan luas panen tidak boleh kosong.');
    if (!prakiraanProduksiPanen)
      throw new ApiError(400, 'Prakiraan hasil panen tidak boleh kosong.');
    if (!prakiraanBulanPanen) throw new ApiError(400, 'Prakiraan bulan panen tidak boleh kosong.');
    if (!fk_petaniId) throw new ApiError(400, 'Kelompok tidak boleh kosong.');

    const Petani = await dataPetani.findOne({
      where: { id: fk_petaniId }
    });
    if (!Petani) throw new ApiError(400, 'Data Petani tidak ditemukan');

    const data = await tanamanPetani.update(
      {
        statusKepemilikanLahan,
        luasLahan,
        kategori,
        jenis,
        komoditas,
        periodeMusimTanam,
        periodeBulanTanam,
        prakiraanLuasPanen,
        prakiraanProduksiPanen,
        prakiraanBulanPanen,
        fk_petaniId
      },
      { where: { id } }
    );

    res.status(200).json({
      message: 'Data berhasil diupdate.',
      data
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: error.message
    });
  }
};

const uploadDataTanamanPetani = async (req, res) => {
  const { peran } = req.user || {};

  try {
    if (peran === 'petani') {
      throw new ApiError(403, 'Anda tidak memiliki akses.');
    }

    const { file } = req;
    if (!file) throw new ApiError(400, 'File tidak ditemukan.');

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(file.buffer);

    const worksheet = workbook.getWorksheet(1);
    const rowCount = worksheet.rowCount;
    if (rowCount < 2) throw new ApiError(400, 'Data tidak ditemukan.');

    for (let index = 2; index <= rowCount; index++) {
      const row = worksheet.getRow(index);

      // if cells are null, then skip
      let isRowEmpty = true;
      for (let j = 1; j <= 11; j++) {
        if (row.getCell(j).value) {
          isRowEmpty = false;
          break;
        }
      }
      if (isRowEmpty) {
        continue;
      }

      const nikPetani = row.getCell(1).value.toString(); // Fix variable name
      const petani = await dataPetani.findOne({
        where: { nik: nikPetani }
      });
      if (petani) {
        // Check if petani is found before creating tanamanPetani
        await tanamanPetani.create({
          fk_petaniId: petani.id,
          statusKepemilikanLahan: row.getCell(2).value,
          luasLahan: row.getCell(3).value,
          kategori: row.getCell(4).value,
          jenis: row.getCell(5).value,
          komoditas: row.getCell(6).value,
          periodeMusimTanam: row.getCell(7).value,
          periodeBulanTanam: row.getCell(8).value,
          prakiraanLuasPanen: row.getCell(9).value,
          prakiraanProduksiPanen: row.getCell(10).value,
          prakiraanBulanPanen: row.getCell(11).value
        });
      } else {
        throw new ApiError(400, `Petani dengan NIK ${nikPetani} tidak ditemukan.`);
      }
    }

    res.status(201).json({
      message: 'Data berhasil ditambahkan.'
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: error.message
    });
  }
};

module.exports = {
  getAllTanamanPetani,
  getTopTanamanPetani,
  tambahDataTanamanPetani,
  getTanamanPetaniStatistically,
  getAllTanamanPetaniByPetani,
  getTanamanbyPetani,
  editDataTanamanPetani,
  deleteDatatanamanPetani,
  getDetailedDataTanamanPetani,
  uploadDataTanamanPetani,
  getAllTanamanPetaniByPenyuluh
};
