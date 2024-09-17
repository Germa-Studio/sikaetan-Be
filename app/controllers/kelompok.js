const { kelompok, kecamatan, desa } = require('../models');

const ApiError = require('../../utils/ApiError');
const dotenv = require('dotenv');
const { fn, col, Op } = require('sequelize');
const ExcelJS = require('exceljs');
const { postActivity } = require('./logActivity');

dotenv.config();

const getAllKelompok = async (req, res) => {
  const { peran } = req.user || {};
  const { page, limit } = req.query;
  try {
    if (peran !== 'operator super admin' && peran !== 'operator admin') {
      throw new ApiError(403, 'Anda tidak memiliki akses.');
    } else {
      const limitFilter = Number(limit) || 10;
      const pageFilter = Number(page) || 1;

      const query = {
        limit: limitFilter,
        offset: (pageFilter - 1) * limitFilter,
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
      };
      const data = await kelompok.findAll({ ...query });
      const total = await kelompok.count({ ...query });
      res.status(200).json({
        message: 'Data Kelompok Berhasil Diperoleh',
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

const getKelompokById = async (req, res) => {
  const { peran } = req.user || {};
  const { id } = req.params;

  try {
    if (peran !== 'operator super admin' && peran !== 'operator admin') {
      throw new ApiError(403, 'Anda tidak memiliki akses.');
    }

    const data = await kelompok.findByPk(id, {
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
    if (!data) {
      throw new ApiError(404, 'Data kelompok tidak ditemukan.');
    }

    res.status(200).json({
      message: 'Data kelompok berhasil diperoleh.',
      data
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: error.message
    });
  }
};

const editKelompokById = async (req, res) => {
  const { peran } = req.user || {};
  const { id } = req.params;
  const {
    gapoktan,
    namaKelompok,
    desa: inputDesa,
    kecamatan: inputKecamatan,
    kecamatanId,
    desaId
  } = req.body;

  try {
    if (peran !== 'operator super admin' && peran !== 'operator admin') {
      throw new ApiError(403, 'Anda tidak memiliki akses.');
    }

    const data = await kelompok.findByPk(id);
    if (!data) {
      throw new ApiError(404, 'Data kelompok tidak ditemukan.');
    }

    let kecamatanData;
    if (!kecamatanId) {
      kecamatanData = await kecamatan.findOne({
        where: {
          nama: inputKecamatan
        }
      });
      if (!kecamatanData) {
        throw new ApiError(404, 'Data kecamatan tidak ditemukan.');
      }
    }
    let desaData;
    if (!desaId) {
      desaData = await desa.findOne({
        where: {
          nama: inputDesa,
          kecamatanId: kecamatanData.id
        }
      });
      if (!desaData) {
        throw new ApiError(404, 'Data desa tidak ditemukan.');
      }
    }

    await kelompok.update(
      {
        gapoktan,
        namaKelompok,
        desa: inputDesa,
        kecamatan: inputKecamatan,
        kecamatanId: kecamatanId || kecamatanData.id,
        desaId: desaId || desaData.id
      },
      {
        where: {
          id
        }
      }
    );

    await postActivity({
      user_id: req.user.id,
      activity: 'UPDATE',
      type: 'KELOMPOK',
      detail_id: id
    });

    res.status(200).json({
      message: 'Data kelompok berhasil diubah.'
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: error.message
    });
  }
};

const deleteKelompok = async (req, res) => {
  const { peran } = req.user || {};
  const { id } = req.params;

  try {
    if (peran !== 'operator super admin' && peran !== 'operator admin') {
      throw new ApiError(403, 'Anda tidak memiliki akses.');
    }

    const data = await kelompok.findByPk(id);
    if (!data) {
      throw new ApiError(404, 'Data kelompok tidak ditemukan.');
    }

    await kelompok.destroy({
      where: {
        id
      }
    });

    await postActivity({
      user_id: req.user.id,
      activity: 'DELETE',
      type: 'KELOMPOK',
      detail_id: id
    });

    res.status(200).json({
      message: 'Data kelompok berhasil dihapus.'
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: error.message
    });
  }
};

const getAllKecamatan = async (req, res) => {
  try {
    const data = await kelompok.findAll({
      attributes: [[fn('DISTINCT', col('kecamatan')), 'kecamatan']]
    });

    res.status(200).json({
      message: 'Data kecamatan berhasil diperoleh.',
      data
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: error.message
    });
  }
};

const getAllDesaInKecamatan = async (req, res) => {
  const { kecamatan: inputKecamatan } = req.query;

  try {
    const data = await kelompok.findAll({
      attributes: [[fn('DISTINCT', col('desa')), 'desa']],
      where: {
        kecamatan: inputKecamatan
      }
    });

    res.status(200).json({
      message: 'Data desa berhasil diperoleh.',
      data
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: error.message
    });
  }
};

const uploadDataKelompoks = async (req, res) => {
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
      for (let j = 2; j <= 5; j++) {
        if (row.getCell(j).value) {
          isRowEmpty = false;
          break;
        }
      }
      if (isRowEmpty) {
        continue;
      }
      const kecamatanData = await kecamatan.findOne({
        where: {
          [Op.or]: [{ id: row.getCell(5).value }, { nama: row.getCell(5).value }]
        }
      });
      if (!kecamatanData) {
        throw new ApiError(404, `Kecamatan ${row.getCell(5).value} tidak ditemukan.`);
      }
      const desaData = await desa.findOne({
        where: {
          [Op.or]: [{ id: row.getCell(4).value }, { nama: row.getCell(4).value }],
          kecamatanId: kecamatanData.id
        }
      });
      if (!desaData) {
        throw new ApiError(404, `Desa ${row.getCell(4).value} tidak ditemukan.`);
      }

      await kelompok.create({
        gapoktan: row.getCell(2).value,
        namaKelompok: row.getCell(3).value,
        desa: row.getCell(4).value,
        kecamatan: row.getCell(5).value,
        kecamatanId: kecamatanData.id,
        desaId: desaData.id
      });
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

const changeKecamatanToId = async (req, res) => {
  const { peran } = req.user || {};
  try {
    const { debug, wrongKecamatan, correctKecamatan, getWrong } = req.query;

    if (peran === 'petani') {
      throw new ApiError(403, 'Anda tidak memiliki akses.');
    }

    if (getWrong) {
      const data = await kelompok.findAll({
        where: {
          [Op.and]: [{ kecamatan: { [Op.not]: null } }, { kecamatanId: null }]
        },
        include: [
          {
            model: kecamatan,
            as: 'kecamatanData'
          }
        ]
      });
      return res.status(200).json({
        message: 'Berhasil mendapatkan data kelompok',
        data
      });
    }

    if (debug) {
      const data = await kelompok.findAll({
        where: {
          kecamatan: {
            [Op.like]: `%${wrongKecamatan}%`
          }
        }
      });

      return res.status(200).json({
        message: 'Berhasil mendapatkan data kelompok',
        data
      });
    }

    if (correctKecamatan) {
      await kelompok.update(
        {
          kecamatan: correctKecamatan
        },
        {
          where: {
            kecamatan: wrongKecamatan
          }
        }
      );
    } else {
      const dataKecamatans = await kecamatan.findAll({});

      for (let i = 0; i < dataKecamatans.length; i++) {
        const kecamatanResult = dataKecamatans[i];

        await kelompok.update(
          {
            kecamatanId: kecamatanResult.id
          },
          {
            where: {
              kecamatan: kecamatanResult.nama
            }
          }
        );
      }
    }

    return res.status(200).json({
      message: 'Berhasil mengubah kecamatan'
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: error.message
    });
  }
};

const changeDesaToId = async (req, res) => {
  const { peran } = req.user || {};
  try {
    const { debug, wrongDesa, correctDesa, getWrong, kecamatanId, updateEmpty } = req.query;

    if (peran === 'petani') {
      throw new ApiError(403, 'Anda tidak memiliki akses.');
    }

    if (getWrong) {
      const data = await kelompok.findAll({
        where: {
          [Op.and]: [
            { desa: { [Op.not]: null } },
            { desaId: null },
            kecamatanId ? { kecamatanId } : {}
          ]
        }
      });
      return res.status(200).json({
        message: 'Berhasil mendapatkan data kelompok',
        data
      });
    }

    if (debug) {
      const data = await kelompok.findAll({
        where: {
          desa: {
            [Op.like]: `%${wrongDesa}%`
          }
        }
      });

      return res.status(200).json({
        message: 'Berhasil mendapatkan data kelompok',
        data
      });
    }

    if (updateEmpty) {
      await kelompok.update(
        {
          desa: col('alamat')
        },
        {
          where: {
            desa: ''
          }
        }
      );
    }

    if (correctDesa) {
      await kelompok.update(
        {
          desa: correctDesa
        },
        {
          where: {
            [Op.and]: [{ desa: wrongDesa }, kecamatanId ? { kecamatanId } : {}]
          }
        }
      );
    } else {
      const dataDesas = await desa.findAll({});

      for (let i = 0; i < dataDesas.length; i++) {
        const desaResult = dataDesas[i];

        await kelompok.update(
          {
            desaId: desaResult.id
          },
          {
            where: {
              desa: desaResult.nama,
              kecamatanId: desaResult.kecamatanId
            }
          }
        );
      }
    }

    return res.status(200).json({
      message: 'Berhasil mengubah desa'
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: error.message
    });
  }
};

module.exports = {
  uploadDataKelompoks,
  editKelompokById,
  getKelompokById,
  deleteKelompok,
  getAllKelompok,
  getAllKecamatan,
  getAllDesaInKecamatan,
  changeKecamatanToId,
  changeDesaToId
};
