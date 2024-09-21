const {
  dataPerson,
  dataPenyuluh,
  presesiKehadiran,
  jurnalHarian,
  riwayatChat,
  tbl_akun,
  kelompok,
  dataPetani,
  kecamatan,
  desa,
  kecamatanBinaan,
  desaBinaan
} = require('../models');
const ApiError = require('../../utils/ApiError');
const imageKit = require('../../midleware/imageKit');
const dotenv = require('dotenv');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const ExcelJS = require('exceljs');
const { postActivity } = require('./logActivity');
const { Op, col, fn, literal } = require('sequelize');

dotenv.config();

const tambahDataPenyuluh = async (req, res) => {
  const { peran, id } = req.user || {};
  try {
    if (peran === 'petani' || peran === 'penyuluh') {
      throw new ApiError(403, 'Anda tidak memiliki akses.');
    } else {
      const {
        NIP,
        email,
        NoWa,
        alamat,
        desa: inputDesa,
        desaId,
        nama,
        kecamatan: inputKecamatan,
        kecamatanId,
        password,
        namaProduct,
        kecamatanBinaan,
        desaBinaan,
        selectedKelompokIds,
        pekerjaan = ''
      } = req.body;
      const kelompokArray = selectedKelompokIds.split(',');
      const hashedPassword = bcrypt.hashSync(password, 10);
      const accountID = crypto.randomUUID();
      const { file } = req;
      const penyuluh = await dataPenyuluh.findOne({
        where: { nik: NIP }
      });
      let urlImg;
      if (!NIP) {
        throw new ApiError(400, 'NIP tidak boleh kosong');
      }
      if (!nama) {
        throw new ApiError(400, 'nama tidak boleh kosong');
      }
      if (penyuluh) {
        throw new ApiError(400, 'NIP sudah digunakan');
      }
      if (file) {
        const validFormat =
          file.mimetype === 'image/png' ||
          file.mimetype === 'image/jpg' ||
          file.mimetype === 'image/jpeg' ||
          file.mimetype === 'image/gif';
        if (!validFormat) {
          return res.status(400).json({
            status: 'failed',
            message: 'Wrong Image Format'
          });
        }
        const split = file.originalname.split('.');
        const ext = split[split.length - 1];

        // upload file ke imagekit
        try {
          const img = await imageKit.upload({
            file: file.buffer,
            fileName: `IMG-${Date.now()}.${ext}`
          });
          urlImg = img.url;
        } catch (uploadError) {
          console.error('Error uploading image:', uploadError.message);
          // Handle the error, and possibly return an error response to the client.
          return res.status(500).json({
            status: 'failed',
            message: 'Error uploading image.'
          });
        }
      }

      {
        /* Membuat akun untuk penyuluh yang didaftarkan */
      }
      const newAccount = await tbl_akun.create({
        email,
        password: hashedPassword,
        no_wa: NoWa,
        nama,
        pekerjaan,
        peran: 'penyuluh',
        foto: urlImg,
        accountID: accountID
      });

      {
        /* Menambahkan penyuluh yang didaftarkan */
      }
      let kecamatanData;
      let desaData;
      if (!kecamatanId) {
        kecamatanData = await kecamatan.findOne({
          where: { nama: inputKecamatan }
        });
        if (!kecamatanData) {
          throw new ApiError(400, `Kecamatan ${inputKecamatan} tidak ditemukan`);
        }
      }
      if (!desaId) {
        desaData = await desa.findOne({
          where: { nama: inputDesa }
        });
        if (!desaData) {
          throw new ApiError(400, `Desa ${inputDesa} tidak ditemukan`);
        }
      }
      const newPenyuluh = await dataPenyuluh.create({
        nik: NIP,
        nama: nama,
        foto: urlImg,
        alamat,
        email,
        noTelp: NoWa,
        kecamatan: inputKecamatan,
        desa: inputDesa,
        password: hashedPassword,
        namaProduct,
        desaBinaan: desaBinaan,
        kecamatanBinaan,
        accountID: accountID,
        kecamatanId: kecamatanData.id,
        desaId: desaData.id
      });
      // Convert each element of kelompokArray to an integer
      const integerKelompokArray = kelompokArray.map((kelompokId) => parseInt(kelompokId, 10));

      // Loop through the integerKelompokArray
      integerKelompokArray.forEach(async (kelompokId) => {
        // Do something with each kelompokId
        const dataKelompok = await kelompok.findOne({
          where: { id: kelompokId }
        });
        if (dataKelompok) {
          await kelompok.update(
            {
              penyuluh: newPenyuluh.id
            },
            {
              where: {
                id: dataKelompok.id
              }
            }
          );
        }
      });

      postActivity({
        user_id: id,
        activity: 'CREATE',
        type: 'DATA PENYULUH',
        detail_id: newPenyuluh.id
      });

      res.status(200).json({
        message: 'berhasil menambahkan data Penyuluh',
        newPenyuluh,
        newAccount
      });
    }
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: error.message
    });
  }
};

const uploadDataPenyuluh = async (req, res) => {
  const { peran, id } = req.user || {};
  try {
    if (peran === 'petani' || peran === 'penyuluh') {
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

      const accountID = crypto.randomUUID();
      const password = row.getCell(6).value.toString();
      const hashedPassword = bcrypt.hashSync(password, 10);
      const urlImg =
        'https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/images/bg-7.png';

      const kecamatanData = await kecamatan.findOne({
        where: { nama: row.getCell(8).value.toString() }
      });
      if (!kecamatanData) {
        throw new ApiError(400, `Kecamatan ${row.getCell(8).value.toString()} tidak ditemukan`);
      }
      const desaData = await desa.findOne({
        where: { nama: row.getCell(9).value.toString() }
      });
      if (!desaData) {
        throw new ApiError(400, `Desa ${row.getCell(9).value.toString()} tidak ditemukan`);
      }

      const newPenyuluh = await dataPenyuluh.create({
        nik: row.getCell(1).value.toString(),
        nama: row.getCell(2).value.toString(),
        foto: urlImg,
        alamat: row.getCell(3).value.toString(),
        email: row.getCell(4).value.toString(),
        noTelp: row.getCell(5).value.toString(),
        kecamatan: row.getCell(8).value.toString(),
        desa: row.getCell(9).value.toString(),
        password: hashedPassword,
        namaProduct: row.getCell(7).value.toString(),
        desaBinaan: row.getCell(10).value.toString(),
        kecamatanBinaan: row.getCell(11).value.toString(),
        accountID: accountID,
        kecamatanId: kecamatanData.id,
        desaId: desaData.id
      });

      await tbl_akun.create({
        email: row.getCell(4).value.toString(),
        password: hashedPassword,
        no_wa: row.getCell(5).value.toString(),
        nama: row.getCell(2).value.toString(),
        pekerjaan: '',
        peran: 'penyuluh',
        foto: urlImg,
        accountID: accountID
      });

      postActivity({
        user_id: id,
        activity: 'CREATE',
        type: 'DATA PENYULUH',
        detail_id: newPenyuluh.id
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

const opsiPenyuluh = async (req, res) => {
  try {
    const dataDaftarPenyuluh = await dataPenyuluh.findAll({
      include: [
        { model: kecamatan, as: 'kecamatanData' },
        { model: desa, as: 'desaData' },
        {
          model: kecamatanBinaan,
          as: 'kecamatanBinaanData',
          include: [
            {
              model: kecamatan
            }
          ]
        },
        {
          model: desaBinaan,
          as: 'desaBinaanData',
          include: [
            {
              model: desa
            }
          ]
        }
      ]
    });
    res.status(200).json({
      message: 'Semua Data Penyuluh',
      dataDaftarPenyuluh
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: error.message
    });
  }
};

const daftarPenyuluh = async (req, res) => {
  const { peran } = req.user || {};
  const { page, limit } = req.query;
  try {
    if (peran === 'petani' || peran === 'penyuluh') {
      throw new ApiError(403, 'Anda tidak memiliki akses.');
    }
    const limitFilter = Number(limit) || 10;
    const pageFilter = Number(page) || 1;
    const query = {
      limit: limitFilter,
      offset: (pageFilter - 1) * limitFilter,
      include: [
        { model: kecamatan, as: 'kecamatanData' },
        { model: desa, as: 'desaData' },
        {
          model: kecamatanBinaan,
          as: 'kecamatanBinaanData',
          include: [
            {
              model: kecamatan
            }
          ]
        },
        {
          model: desaBinaan,
          as: 'desaBinaanData',
          include: [
            {
              model: desa
            }
          ]
        }
      ]
    };
    const data = await dataPenyuluh.findAll({ ...query });
    const total = await dataPenyuluh.count({});
    res.status(200).json({
      message: 'Semua Data Penyuluh',
      data,
      total,
      currentPages: page,
      limit: limitFilter,
      maxPages: Math.ceil(total / (limitFilter || 10)),
      from: pageFilter ? (pageFilter - 1) * limitFilter + 1 : 1,
      to: pageFilter ? (pageFilter - 1) * limitFilter + data.length : data.length
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: error.message
    });
  }
};

const deleteDaftarPenyuluh = async (req, res) => {
  const { id } = req.params;
  const { peran, id: UserId } = req.user || {};
  try {
    if (peran !== 'operator potan') {
      throw new ApiError(403, 'Anda tidak memiliki akses.');
    } else {
      const data = await dataPenyuluh.findOne({
        where: {
          id: id
        }
      });
      if (!data) throw new ApiError(400, 'data tidak ditemukan.');
      await dataPenyuluh.destroy({
        where: {
          id
        }
      });
      await tbl_akun.destroy({
        where: {
          accountID: data.accountID
        }
      });
      postActivity({
        user_id: UserId,
        activity: 'DELETE',
        type: 'DATA PENYULUH',
        detail_id: id
      });
      res.status(200).json({
        message: 'Petani Berhasil Di Hapus'
      });
    }
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: `gagal menghapus data petani, ${error.message}`
    });
  }
};

const presensiKehadiran = async (req, res) => {
  const { peran } = req.user || {};
  try {
    if (peran !== 'admin' && peran !== 'super admin' && peran !== 'PENYULUH') {
      throw new ApiError(403, 'Anda tidak memiliki akses.');
    } else {
      const DataPresesiKehadiran = await dataPerson.findAll({
        include: [{ model: presesiKehadiran, required: true }, { model: dataPenyuluh }]
      });
      res.status(200).json({
        message: 'Semua Data Presensi Kehadiran',
        DataPresesiKehadiran
      });
    }
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: error.message
    });
  }
};

const presensiKehadiranWeb = async (req, res) => {
  const { peran } = req.user || {};
  try {
    if (peran !== 'admin' && peran !== 'super admin' && peran !== 'PENYULUH') {
      throw new ApiError(403, 'Anda tidak memiliki akses.');
    } else {
      const DataPresesiKehadiran = await presesiKehadiran.findAll({
        include: {
          model: dataPerson,
          required: true,
          include: {
            model: dataPenyuluh
          }
        }
      });
      res.status(200).json({
        message: 'Semua Data Presensi Kehadiran',
        DataPresesiKehadiran
      });
    }
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: error.message
    });
  }
};

const tambahPresensiKehadiran = async (req, res) => {
  const { peran } = req.user || {};
  try {
    if (peran !== 'admin' && peran !== 'super admin' && peran !== 'penyuluh') {
      throw new ApiError(403, 'Anda tidak memiliki akses.');
    } else {
      const { NIP = '', tanggalPresensi, judulKegiatan, deskripsiKegiatan } = req.body;
      const { file } = req;
      const penyuluh = await dataPerson.findOne({ where: { NIP } });

      if (!penyuluh) throw new ApiError(400, `Penyulih dengan NIP ${NIP} Tidak Ditemukan`);
      if (file) {
        const validFormat =
          file.mimetype === 'image/png' ||
          file.mimetype === 'image/jpg' ||
          file.mimetype === 'image/jpeg' ||
          file.mimetype === 'image/gif';
        if (!validFormat) {
          return res.status(400).json({
            status: 'failed',
            message: 'Wrong Image Format'
          });
        }
        const split = file.originalname.split('.');
        const ext = split[split.length - 1];

        // upload file ke imagekit
        const img = await imageKit.upload({
          file: file.buffer,
          fileName: `IMG-${Date.now()}.${ext}`
        });
        const newData = await presesiKehadiran.create({
          id: penyuluh.id,
          tanggalPresesi: tanggalPresensi,
          judulKegiatan,
          deskripsiKegiatan,
          FotoKegiatan: img.url
        });
        return res.status(200).json({
          message: 'Brhasil menambhakan Data Presensi Kehadiran',
          newData
        });
      }
      const newData = await presesiKehadiran.create({
        id: penyuluh.id,
        tanggalPresesi: tanggalPresensi,
        judulKegiatan,
        deskripsiKegiatan
      });
      res.status(200).json({
        message: 'Brhasil menambhakan Data Presensi Kehadiran',
        newData
      });
    }
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: error.message
    });
  }
};

const jurnalKegiatan = async (req, res) => {
  const { peran } = req.user || {};
  try {
    if (peran === 'petani') {
      throw new ApiError(403, 'Anda tidak memiliki akses.');
    } else {
      const newData = await jurnalHarian.findAll({
        include: [
          // { model: jurnalHarian, required: true },
          { model: dataPenyuluh }
        ]
      });
      res.status(200).json({
        message: 'berhasil mendapatkan data Jurnal',
        newData
      });
    }
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: error.message
    });
  }
};

const jurnalKegiatanbyId = async (req, res) => {
  const { peran } = req.user || {};
  const { id } = req.params;
  try {
    if (peran === 'petani') {
      throw new ApiError(403, 'Anda tidak memiliki akses.');
    } else {
      const newData = await jurnalHarian.findOne({
        where: {
          id: id
        },
        include: [
          // { model: jurnalHarian, required: true },
          { model: dataPenyuluh }
        ]
      });
      res.status(200).json({
        message: 'berhasil mendapatkan data Jurnal',
        newData
      });
    }
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: error.message
    });
  }
};

const deleteJurnalKegiatan = async (req, res) => {
  const { id } = req.params;
  const { peran, id: UserId } = req.user || {};
  try {
    if (peran === 'petani') {
      throw new ApiError(403, 'Anda tidak memiliki akses.');
    } else {
      const data = await jurnalHarian.findOne({
        where: {
          id: id
        }
      });
      if (!data) throw new ApiError(400, 'data tidak ditemukan.');
      await jurnalHarian.destroy({
        where: {
          id
        }
      });

      postActivity({
        user_id: UserId,
        activity: 'DELETE',
        type: 'JURNAL HARIAN',
        detail_id: id
      });

      res.status(200).json({
        message: 'Jurnal Berhasil Di Hapus'
      });
    }
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: `gagal menghapus data Jurnal, ${error.message}`
    });
  }
};

const updateJurnalKegiatan = async (req, res) => {
  const { id } = req.params;
  const { nama, peran, id: UserId } = req.user || {};
  try {
    if (peran === 'petani') {
      throw new ApiError(403, 'Anda tidak memiliki akses.');
    } else {
      const {
        judul,
        tanggalDibuat,
        uraian,
        statusJurnal,
        NIK
        // gambar,
      } = req.body;
      const { file } = req;
      const data = await jurnalHarian.findOne({
        where: {
          id
        }
      });
      const penyuluh = await dataPenyuluh.findOne({
        where: { nik: NIK }
      });
      if (!data) throw new ApiError(400, 'data tidak ditemukan.');
      let urlImg;
      if (file?.filename) {
        const validFormat =
          file.mimetype === 'image/png' ||
          file.mimetype === 'image/jpg' ||
          file.mimetype === 'image/jpeg' ||
          file.mimetype === 'image/gif';
        if (!validFormat) {
          return res.status(400).json({
            status: 'failed',
            message: 'Wrong Image Format'
          });
        }
        urlImg = `${process.env.URL_SERVER}/files/jurnal/
        ${file.filename}`;
      }
      const newData = await jurnalHarian.update(
        {
          judul,
          tanggalDibuat,
          uraian,
          statusJurnal,
          gambar: urlImg,
          pengubah: nama,
          fk_penyuluhId: penyuluh.id
        },
        {
          where: {
            id: id
          }
        }
      );

      postActivity({
        user_id: UserId,
        activity: 'EDIT',
        type: 'JURNAL HARIAN',
        detail_id: id
      });

      res.status(200).json({
        message: 'berhasil merubah data Jurnal',
        newData
      });
    }
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: error.message
    });
  }
};

const tambahJurnalKegiatan = async (req, res) => {
  const { nama, peran, id } = req.user || {};
  try {
    if (peran === 'petani') {
      throw new ApiError(403, 'Anda tidak memiliki akses.');
    } else {
      const { NIK, judul, tanggalDibuat, uraian, statusJurnal } = req.body;
      const { file } = req;
      let urlImg;
      if (!NIK) throw new ApiError(400, 'NIP tidak boleh kosong');
      const penyuluh = await dataPenyuluh.findOne({
        where: { nik: NIK }
      });
      if (!penyuluh) throw new ApiError(400, 'NIP tidak Ditemukan');
      if (file) {
        const validFormat =
          file.mimetype === 'image/png' ||
          file.mimetype === 'image/jpg' ||
          file.mimetype === 'image/jpeg' ||
          file.mimetype === 'image/gif';
        if (!validFormat) {
          return res.status(400).json({
            status: 'failed',
            message: 'Wrong Image Format'
          });
        }
        const split = file.originalname.split('.');
        const ext = split[split.length - 1];

        // upload file ke imagekit
        const img = await imageKit.upload({
          file: file.buffer,
          fileName: `IMG-${Date.now()}.${ext}`
        });
        urlImg = img.url;
      }
      const dataJurnalHarian = await jurnalHarian.create({
        judul,
        tanggalDibuat,
        uraian,
        statusJurnal,
        gambar: urlImg,
        pengubah: nama,
        fk_penyuluhId: penyuluh.id
      });

      postActivity({
        user_id: id,
        activity: 'CREATE',
        type: 'JURNAL HARIAN',
        detail_id: dataJurnalHarian.id
      });

      res.status(200).json({
        message: 'berhasil menambahkan data Jurnal',
        dataJurnalHarian
      });
    }
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: error.message
    });
  }
};

const RiwayatChat = async (req, res) => {
  const { peran } = req.user || {};
  try {
    if (peran !== 'admin' && peran !== 'super admin' && peran !== 'penyuluh') {
      throw new ApiError(403, 'Anda tidak memiliki akses.');
    } else {
      const dataRiwayatChat = await dataPerson.findAll({
        include: [{ model: riwayatChat, required: true }, { model: dataPenyuluh }]
      });
      res.status(200).json({
        message: 'Semua Data Riwayat Chat',
        dataRiwayatChat
      });
    }
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: error.message
    });
  }
};
const daftarPenyuluhById = async (req, res) => {
  const { id } = req.params;
  const { peran } = req.user || {};
  try {
    if (peran === 'petani' || peran === 'penyuluh') {
      throw new ApiError(403, 'Anda tidak memiliki akses.');
    }
    const dataDaftarPenyuluh = await dataPenyuluh.findOne({
      where: { id: id },
      include: [
        { model: kelompok, as: 'kelompoks' },
        { model: kecamatan, as: 'kecamatanData' },
        { model: desa, as: 'desaData' },
        {
          model: kecamatanBinaan,
          as: 'kecamatanBinaanData',
          include: [
            {
              model: kecamatan
            }
          ]
        },
        {
          model: desaBinaan,
          as: 'desaBinaanData',
          include: [
            {
              model: desa,
              include: [
                {
                  model: kecamatan
                }
              ]
            }
          ]
        }
      ]
    });

    if (!dataDaftarPenyuluh) {
      throw new ApiError(404, 'Data penyuluh tidak ditemukan.');
    }

    res.status(200).json({
      message: 'Detail Penyuluh',
      dataDaftarPenyuluh
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: error.message
    });
  }
};
const updatePenyuluh = async (req, res) => {
  const { id } = req.params;
  const { peran, id: UserId } = req.user || {};
  try {
    if (peran === 'petani' || peran === 'penyuluh') {
      throw new ApiError(403, 'Anda tidak memiliki akses.');
    } else {
      const {
        nik,
        email,
        NoWa,
        alamat,
        desa: inputDesa,
        desaId,
        nama,
        kecamatan: inputKecamatan,
        kecamatanId,
        password,
        namaProduct,
        kecamatanBinaan,
        desaBinaan
      } = req.body;
      const { file } = req;
      const data = await dataPenyuluh.findOne({
        where: {
          id
        }
      });
      if (!data) throw new ApiError(400, 'data tidak ditemukan.');
      let urlImg;

      if (file) {
        const validFormat =
          file.mimetype === 'image/png' ||
          file.mimetype === 'image/jpg' ||
          file.mimetype === 'image/jpeg' ||
          file.mimetype === 'image/gif';
        if (!validFormat) {
          return res.status(400).json({
            status: 'failed',
            message: 'Wrong Image Format'
          });
        }
        const split = file.originalname.split('.');
        const ext = split[split.length - 1];

        // upload file ke imagekit
        const img = await imageKit.upload({
          file: file.buffer,
          fileName: `IMG-${Date.now()}.${ext}`
        });
        urlImg = img.url;
      }
      const hashedPassword = bcrypt.hashSync(password, 10);
      // decrypt password
      const accountUpdate = await tbl_akun.update(
        {
          email,
          password: hashedPassword,
          no_wa: NoWa,
          nama,
          pekerjaan: '',
          peran: 'penyuluh',
          foto: urlImg
        },
        {
          where: { accountID: data.accountID }
        }
      );

      let kecamatanData;
      if (!kecamatanId) {
        if (!inputKecamatan) {
          throw new ApiError(400, 'Kecamatan tidak boleh kosong');
        }
        kecamatanData = await kecamatan.findOne({
          where: { nama: inputKecamatan }
        });
        if (!kecamatanData) {
          throw new ApiError(400, `Kecamatan ${inputKecamatan} tidak ditemukan`);
        }
      }

      let desaData;
      if (!desaId) {
        if (!inputDesa) {
          throw new ApiError(400, 'Desa tidak boleh kosong');
        }
        desaData = await desa.findOne({
          where: { nama: inputDesa }
        });
        if (!desaData) {
          throw new ApiError(400, `Desa ${inputDesa} tidak ditemukan`);
        }
      }

      const newDataPenyuluh = await dataPenyuluh.update(
        {
          nik,
          email,
          noTelp: NoWa,
          alamat,
          desa: inputDesa,
          nama,
          foto: urlImg,
          kecamatan: inputKecamatan,
          password: hashedPassword,
          namaProduct,
          kecamatanBinaan,
          desaBinaan,
          kecamatanId: kecamatanData?.id ?? kecamatanId,
          desaId: desaData?.id ?? desaId
        },
        {
          where: {
            id: id
          }
        }
      );

      postActivity({
        user_id: UserId,
        activity: 'EDIT',
        type: 'DATA PENYULUH',
        detail_id: id
      });

      res.status(200).json({
        message: 'berhasil merubah data Penyuluh',
        newDataPenyuluh,
        accountUpdate
      });
    }
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: error.message
    });
  }
};

const getKelompok = async (req, res) => {
  const { peran } = req.user || {};
  try {
    if (peran === 'petani') {
      throw new ApiError(403, 'Anda tidak memiliki akses.');
    } else {
      const dataKelompok = await kelompok.findAll();
      // Convert array to object
      const formattedKelompok = dataKelompok.reduce((acc, curr) => {
        acc[curr.id] = curr; // Assuming 'id' is a unique identifier for each kelompok
        return acc;
      }, {});
      res.status(200).json({
        message: 'Semua Data Kelompok',
        dataKelompok: formattedKelompok
      });
    }
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: error.message
    });
  }
};
const getPetani = async (req, res) => {
  const { peran } = req.user || {};
  const { id } = req.params;

  try {
    if (peran === 'petani') {
      throw new ApiError(403, 'Anda tidak memiliki akses.');
    } else {
      const petanis = await dataPetani.findAll({
        where: {
          fk_penyuluhId: id
        },
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
        message: 'Semua Data Petani',
        petanis
      });
    }
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
      const data = await dataPenyuluh.findAll({
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
        message: 'Berhasil mendapatkan data penyuluh',
        data
      });
    }

    if (debug) {
      const data = await dataPenyuluh.findAll({
        where: {
          [Op.or]: [
            {
              kecamatan: {
                [Op.like]: `%${wrongKecamatan}%`
              }
            },
            {
              kecamatanBinaan: {
                [Op.like]: `%${wrongKecamatan}%`
              }
            }
          ]
        }
      });

      return res.status(200).json({
        message: 'Berhasil mendapatkan data penyuluh',
        data
      });
    }

    if (correctKecamatan) {
      await dataPenyuluh.update(
        {
          kecamatan: correctKecamatan
        },
        {
          where: {
            kecamatan: wrongKecamatan
          }
        }
      );
      await dataPenyuluh.update(
        {
          kecamatanBinaan: fn('replace', col('kecamatanBinaan'), wrongKecamatan, correctKecamatan)
        },
        {
          where: {
            kecamatanBinaan: {
              [Op.like]: `%${wrongKecamatan}%`
            }
          }
        }
      );
    } else {
      const dataKecamatans = await kecamatan.findAll({});

      for (let i = 0; i < dataKecamatans.length; i++) {
        const kecamatanResult = dataKecamatans[i];

        await dataPenyuluh.update(
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
      const data = await dataPenyuluh.findAll({
        where: {
          [Op.and]: [
            { desa: { [Op.not]: null } },
            { desaId: null },
            kecamatanId ? { kecamatanId } : {}
          ]
        }
      });
      return res.status(200).json({
        message: 'Berhasil mendapatkan data penyuluh',
        data
      });
    }

    if (debug) {
      const data = await dataPenyuluh.findAll({
        where: {
          [Op.or]: [
            {
              desa: {
                [Op.like]: `%${wrongDesa}%`
              }
            },
            {
              desaBinaan: {
                [Op.like]: `%${wrongDesa}%`
              }
            }
          ]
        }
      });

      return res.status(200).json({
        message: 'Berhasil mendapatkan data penyuluh',
        data
      });
    }

    if (updateEmpty) {
      await dataPenyuluh.update(
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
      await dataPenyuluh.update(
        {
          desa: correctDesa
        },
        {
          where: {
            [Op.and]: [{ desa: wrongDesa }, kecamatanId ? { kecamatanId } : {}]
          }
        }
      );
      await dataPenyuluh.update(
        {
          desaBinaan: fn('replace', col('desaBinaan'), wrongDesa, correctDesa)
        },
        {
          where: {
            desaBinaan: {
              [Op.like]: `%${wrongDesa}%`
            }
          }
        }
      );
    } else {
      const dataDesas = await desa.findAll({});

      for (let i = 0; i < dataDesas.length; i++) {
        const desaResult = dataDesas[i];

        await dataPenyuluh.update(
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

const refactorWilayahBinaan = async (req, res) => {
  const { peran } = req.user || {};
  try {
    const { getWrong, type } = req.query;

    if (peran === 'petani') {
      throw new ApiError(403, 'Anda tidak memiliki akses.');
    }

    let data;
    if (type === 'kecamatan') {
      data = await dataPenyuluh.findAll({
        where: literal('kecamatanBinaanData.id IS NULL AND kecamatanBinaan != ""'),
        include: [
          {
            model: kecamatanBinaan,
            as: 'kecamatanBinaanData',
            required: false
          }
        ]
      });
    } else {
      data = await dataPenyuluh.findAll({
        where: literal('desaBinaanData.id IS NULL AND desaBinaan != ""'),
        include: [
          {
            model: desaBinaan,
            as: 'desaBinaanData',
            required: false
          }
        ]
      });
    }
    if (getWrong) {
      return res.status(200).json({
        message: 'Berhasil mendapatkan data penyuluh',
        data
      });
    }

    const failedList = [];
    const successList = [];
    if (type === 'kecamatan') {
      for (let i = 0; i < data.length; i++) {
        const penyuluh = data[i];
        const kecamatanBinaans = penyuluh.kecamatanBinaan
          .split(',')
          .map((kecamatan) => kecamatan.trim());
        for (let j = 0; j < kecamatanBinaans.length; j++) {
          const namaKecamatanBinaan = kecamatanBinaans[j];
          const kecamatanBinaanData = await kecamatan.findOne({
            where: {
              nama: namaKecamatanBinaan
            }
          });
          if (kecamatanBinaanData) {
            // return res.status(200).json({
            //   message: 'Berhasil mendapatkan data penyuluh',
            //   kecamatanBinaanData,
            //   penyuluhId: penyuluh.id
            // });
            await kecamatanBinaan.create({
              kecamatanId: kecamatanBinaanData.id,
              penyuluhId: penyuluh.id
            });
            successList.push({
              penyuluhId: penyuluh.id,
              kecamatanBinaan: namaKecamatanBinaan
            });
          } else {
            failedList.push({
              penyuluhId: penyuluh.id,
              kecamatanBinaan: namaKecamatanBinaan
            });
          }
        }
      }
    } else {
      for (let i = 0; i < data.length; i++) {
        const penyuluh = data[i];
        const desaBinaans = penyuluh.desaBinaan.split(',').map((desa) => desa.trim());

        for (let j = 0; j < desaBinaans.length; j++) {
          const namaDesaBinaan = desaBinaans[j];
          const desaBinaanData = await desa.findOne({
            where: {
              nama: namaDesaBinaan
            }
          });
          if (desaBinaanData) {
            // return res.status(200).json({
            //   message: 'Berhasil mendapatkan data penyuluh',
            //   desaBinaanData,
            //   penyuluhId: penyuluh.id
            // });
            await desaBinaan.create({
              desaId: desaBinaanData.id,
              penyuluhId: penyuluh.id
            });
            successList.push({
              penyuluhId: penyuluh.id,
              desaBinaan: namaDesaBinaan
            });
          } else {
            failedList.push({
              penyuuluhId: penyuluh.id,
              desaBinaan: namaDesaBinaan
            });
          }
        }
      }
    }

    if (successList.length > 0) {
      return res.status(200).json({
        message: 'Berhasil mengubah wilayah binaan',
        successList
      });
    }
    return res.status(400).json({
      message: 'Gagal mengubah wilayah binaan',
      failedList
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: error.message
    });
  }
};

const tambahWilayahBinaan = async (req, res) => {
  const { peran } = req.user || {};
  try {
    const { type, penyuluhId, wilayahId } = req.body;

    if (peran === 'petani') {
      throw new ApiError(403, 'Anda tidak memiliki akses.');
    }

    if (type === 'kecamatan') {
      const kecamatanData = await kecamatan.findOne({
        where: {
          id: wilayahId
        }
      });
      if (!kecamatanData) {
        throw new ApiError(400, 'Kecamatan tidak ditemukan');
      }
      await kecamatanBinaan.create({
        kecamatanId: wilayahId,
        penyuluhId: penyuluhId
      });
    } else {
      const desaData = await desa.findOne({
        where: {
          id: wilayahId
        }
      });
      if (!desaData) {
        throw new ApiError(400, 'Desa tidak ditemukan');
      }
      await desaBinaan.create({
        desaId: desaData.id,
        penyuluhId: penyuluhId
      });
    }

    return res.status(200).json({
      message: 'Berhasil menambahkan wilayah binaan'
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: error.message
    });
  }
};

const deleteWilayahBinaan = async (req, res) => {
  const { peran } = req.user || {};
  try {
    const { type, penyuluhId, wilayahId } = req.body;

    if (peran === 'petani') {
      throw new ApiError(403, 'Anda tidak memiliki akses.');
    }

    if (type === 'kecamatan') {
      await kecamatanBinaan.destroy({
        where: {
          kecamatanId: wilayahId,
          penyuluhId
        }
      });
    } else {
      await desaBinaan.destroy({
        where: {
          desaId: wilayahId,
          penyuluhId
        }
      });
    }

    return res.status(200).json({
      message: 'Berhasil menghapus wilayah binaan'
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: error.message
    });
  }
};

module.exports = {
  tambahDataPenyuluh,
  presensiKehadiran,
  jurnalKegiatan,
  RiwayatChat,
  tambahJurnalKegiatan,
  tambahPresensiKehadiran,
  daftarPenyuluh,
  deleteDaftarPenyuluh,
  presensiKehadiranWeb,
  daftarPenyuluhById,
  updatePenyuluh,
  uploadDataPenyuluh,
  jurnalKegiatanbyId,
  deleteJurnalKegiatan,
  updateJurnalKegiatan,
  opsiPenyuluh,
  getKelompok,
  getPetani,
  changeKecamatanToId,
  changeDesaToId,
  refactorWilayahBinaan,
  tambahWilayahBinaan,
  deleteWilayahBinaan
};
