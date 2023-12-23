const {
  dataPerson,
  tanamanPetani,
  kelompok,
  laporanTanam,
  dataPenyuluh,
  dataPetani,
  tbl_akun,
} = require("../models");
const { Op, NOW } = require("sequelize");
const ApiError = require("../../utils/ApiError");
const imageKit = require("../../midleware/imageKit");
//import bycrypt
const bcrypt = require("bcrypt");

const laporanPetani = async (req, res) => {
  try {
    const data = await dataPerson.findAll({
      include: [
        {
          model: kelompok,
        },
        {
          model: tanamanPetani,
        },
        {
          model: laporanTanam,
        },
      ],
      where: {
        role: "petani",
      },
    });
    res.status(200).json({
      message: "Data laporan Tani Berhasil Diperoleh",
      tani: data,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: error.message,
    });
  }
};

const laporanPenyuluh = async (req, res) => {
  try {
    const data = await dataPerson.findAll({
      include: [
        {
          model: kelompok,
        },
        {
          model: tanamanPetani,
        },
        {
          model: laporanTanam,
          required: true,
        },
      ],
      where: {
        NIP: {
          [Op.not]: null,
        },
      },
    });
    res.status(200).json({
      message: "Data laporan Penyuluh Berhasil Diperoleh",
      penyuluh: data,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: error.message,
    });
  }
};

const tambahDaftarTani = async (req, res) => {
  const { peran } = req.user;
  try {
    if (
      peran !== "admin" &&
      peran !== "super admin" &&
      peran !== "penyuluh"
    ) {
      throw new ApiError(400, "Anda tidak memiliki akses.");
    } else {
      const {
        NIK,
        nokk,
        NoWa,
        email,
        alamat,
        desa,
        nama,
        kecamatan,
        password,
        gapoktan,
        penyuluh,
        namaKelompok,
      } = req.body;

      if (!NIK){
        throw new ApiError(400, "NIK tidak boleh kosong");
      } 
      if (!nama){
        throw new ApiError(400, "nama tidak boleh kosong");
      } 
      if (!penyuluh){
        throw new ApiError(400, "penyuluh tidak boleh kosong");
      } 
      const tani = await dataPetani.findOne({ where: { nik:NIK } });
      if (tani){
        throw new ApiError(400, "NIK sudah digunakan");
      } 
      const { file } = req;
      const penyuluhData = await dataPenyuluh.findOne({ where: { id: penyuluh } });
      const hashedPassword = bcrypt.hashSync(password, 10);
      const accountID = Math.floor(100000 + Math.random() * 900000);
      const kelompokData = await kelompok.findOne({
        where: { 
          gapoktan:gapoktan, 
          namaKelompok:namaKelompok, 
          desa:desa
        }
      })
      // console.log(kelompokData)
      let urlImg;
      if (file) {
        const validFormat =
          file.mimetype === "image/png" ||
          file.mimetype === "image/jpg" ||
          file.mimetype === "image/jpeg" ||
          file.mimetype === "image/gif";
        if (!validFormat) {
          return res.status(400).json({
            status: "failed",
            message: "Wrong Image Format",
          });
        }
        const split = file.originalname.split(".");
        const ext = split[split.length - 1];

        // upload file ke imagekit
        const img = await imageKit.upload({
          file: file.buffer,
          fileName: `IMG-${Date.now()}.${ext}`,
        });
        img.url;
        urlImg = img.url;
        console.log({ ...req.body, img: img.url });
      }
      const newAccount = await tbl_akun.create({
        email,
        password: hashedPassword,
        no_wa: NoWa,
        nama,
        pekerjaan:'',
        peran:"petani",
        foto:urlImg,
        accountID: accountID,
      });
      const daftarPetani = await dataPetani.create({
        nik: NIK
        , nkk: nokk
        , foto:urlImg
        , nama
        , alamat
        , desa
        , kecamatan
        , password: hashedPassword
        , email
        , noTelp: NoWa
        , accountID: accountID
        , fk_penyuluhId: penyuluhData.id
        , fk_kelompokId: kelompokData.id
      })

      res.status(200).json({
        message: "Berhasil Menambahakan Daftar Tani",
        daftarPetani,
        newAccount,
      });
    }
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: error.message,
    });
  }
};

const tambahLaporanTani = async (req, res) => {
  try {
    const { NIK, tanggalLaporan, komdisiTanaman, deskripsi } = req.body;
    const { file } = req;
    let urlImg;
    if (file) {
      const validFormat =
        file.mimetype === "image/png" ||
        file.mimetype === "image/jpg" ||
        file.mimetype === "image/jpeg" ||
        file.mimetype === "image/gif";
      if (!validFormat) {
        return res.status(400).json({
          status: "failed",
          message: "Wrong Image Format",
        });
      }
      const split = file.originalname.split(".");
      const ext = split[split.length - 1];

      // upload file ke imagekit
      const img = await imageKit.upload({
        file: file.buffer,
        fileName: `IMG-${Date.now()}.${ext}`,
      });
      urlImg = img.url;
    }

    const dataLaporanTanam = await laporanTanam.create({
      tanggalLaporan,
      komdisiTanaman,
      deskripsi,
      fotoTanaman: urlImg,
    });
    await dataPerson.update(
      { laporanTanamId: dataLaporanTanam.id },
      {
        where: {
          NIK,
        },
      }
    );
    res.status(200).json({
      message: "Berhasil Menambahkan Laporan",
      dataLaporanTanam,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: error.message,
    });
  }
};

const daftarTani = async (req, res) => {
  try {
    const { userInfo } = req.user;
    if (userInfo !== null) {
      const data = await dataPetani.findAll({
        include: [
          {
            model: kelompok,
          },
          {
            model: dataPenyuluh,
          }
        ],
      });
      res.status(200).json({
        message: "Data laporan Tani Berhasil Diperoleh",
        tani: data,
      });
    } else {
      throw new ApiError(400, "Anda tidak memiliki akses.");
    }
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: error.message,
    });
  }
};

const deleteDaftarTani = async (req, res) => {
  const { id } = req.params;
  const { peran } = req.user;
  try {
    if (peran !== "super admin") {
      throw new ApiError(400, "Anda tidak memiliki akses.");
    } else {
      const data = await dataPetani.findOne({
        where: {
          id,
        },
      });
      if (!data) throw new ApiError(400, "data tidak ditemukan.");
      await dataPetani.destroy({
        where: {
          id,
        },
      });
      await tbl_akun.destroy({
        where:{
          accountID:data.accountID
        }
      })
      res.status(200).json({
        message: "Petani Berhasil Di Hapus",
      });
    }
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: `gagal menghapus data petani, ${error.message}`,
    });
  }
};

const dataTaniDetail = async (req, res) => {
  const { id } = req.params;
  try {
    const data = await dataPetani.findOne({
      where: {
        id:id,
      },
      include: [
        {
          model: kelompok,
        },
        {
          model: dataPenyuluh,
        }
      ],
    });
    res.status(200).json({
      message: "Petani Berhasil Di Peroleh",
      detailTani: data,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: `gagal mendapatkan data petani, ${error.message}`,
    });
  }
};

const updateTaniDetail = async (req, res) => {
  const { peran } = req.user;
  const { id } = req.params;
  const {
    NIK,
    nokk,
    email,
    NoWa,
    alamat,
    desa,
    nama,
    kecamatan,
    password,
    namaKelompok,
    penyuluh,
    gapoktan,
    foto,
  } = req.body;

  try {
    if (
      peran !== "admin" &&
      peran !== "super admin" &&
      peran !== "penyuluh"
    ) {
      throw new ApiError(400, "Anda tidak memiliki akses.");
    } else {
      const data = await dataPetani.findOne({
        where: {
          id,
        },
      });
      if (!data) throw new ApiError(400, "data tidak ditemukan.");
      const kelompokData = await kelompok.findOne({
        where: { 
          gapoktan:gapoktan, 
          namaKelompok:namaKelompok, 
          desa:desa
        }
      })
      const penyuluhData = await dataPenyuluh.findOne({
        where: {
          id: penyuluh,
        }
      })
      let urlImg
      const { file } = req;
      console.log(file);
      if (file) {
        const validFormat =
          file.mimetype === "image/png" ||
          file.mimetype === "image/jpg" ||
          file.mimetype === "image/jpeg" ||
          file.mimetype === "image/gif";
        if (!validFormat) {
          return res.status(400).json({
            status: "failed",
            message: "Wrong Image Format",
          });
        }
        const split = file.originalname.split(".");
        const ext = split[split.length - 1];

        // upload file ke imagekit
        const img = await imageKit.upload({
          file: file.buffer,
          fileName: `IMG-${Date.now()}.${ext}`,
        });
        img.url;
        urlImg = img.url;
      }
      const hashedPassword = bcrypt.hashSync(password, 10);
      const accountUpdate = await tbl_akun.update(
        {
          email,
          password: hashedPassword,
          no_wa: NoWa,
          nama,
          pekerjaan:'',
          peran:"petani",
          foto:urlImg,
        },
        {
          where: { accountID: data.accountID },
        }
      );
      const petaniUpdate = await dataPetani.update(
        {
          nik: NIK
          , nkk: nokk
          , foto:urlImg
          , nama
          , alamat
          , desa
          , kecamatan
          , password: hashedPassword
          , email
          , noTelp: NoWa
          , fk_penyuluhId: penyuluhData.id
          , fk_kelompokId: kelompokData.id
        },
        {
          where: { id },
        }
      );
      res.status(200).json({
        message: "Berhasil Mengupdate Data Petani",
        petaniUpdate,
        accountUpdate,
      });
    }
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: `Failed to update data petani. ${error.message}`,
    });
  }
};

const getLaporanPetani = async (req, res) => {
  const { id } = req.params;
  try {
    const data = await dataPerson.findOne({
      include: [
        {
          model: kelompok,
        },
        {
          model: tanamanPetani,
        },
      ],
      where: {
        role: "petani",
        id,
      },
    });
    res.status(200).json({
      message: "Data laporan Tani Berhasil Diperoleh",
      tani: data,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: error.message,
    });
  }
};

const tambahTanamanPetani = async (req, res) => {
  try {
    const {
      
    } = req.body;
    for (const key in req.body) {
      if (!req.body[key] && key != "jenis" && key != "jenisPanen") {
        throw new ApiError(400, `${key} harus di isi`);
      }
    }
    const data = await dataPerson.findOne({
      where: {
        role: "petani",
        id: dataPersonId,
      },
    });
    if (!data) {
      throw new ApiError(400, "data petani tidak sesuai");
    }
    const dataTanamanPetani = await tanamanPetani.create({
      perkiraanHasilPanen,
      perkiraanPanen,
      tanggalTanam,
      musimTanam,
      komoditas,
      jenisPanen,
      jenis,
      kategori,
      dataPersonId,
      statusLahan,
      luasLahan,
    });
    res.status(200).json({
      message: "Berhasil Menambahkan Tanaman Petani",
      dataTanamanPetani,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: error.message,
    });
  }
};

const ubahTanamanPetaniById = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      statusLahan,
      luasLahan,
      kategori,
      jenis = "-",
      jenisPanen,
      komoditas,
      musimTanam,
      tanggalTanam,
      perkiraanPanen,
      perkiraanHasilPanen,
      realisasiHasilPanen,
    } = req.body;
    for (const key in req.body) {
      if (!req.body[key] && key != "jenis") {
        throw new ApiError(400, `${key} harus di isi`);
      }
    }
    const data = await tanamanPetani.findOne({
      where: {
        id,
      },
    });
    if (!data) {
      throw new ApiError(400, "data petani tidak sesuai");
    }
    await tanamanPetani.update(
      {
        realisasiHasilPanen,
        perkiraanHasilPanen,
        perkiraanPanen,
        tanggalTanam,
        musimTanam,
        komoditas,
        jenisPanen,
        jenis,
        kategori,
        statusLahan,
        luasLahan,
      },
      {
        where: { id },
      }
    );
    res.status(200).json({
      message: "Berhasil Merubah Tanaman Petani",
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: error.message,
    });
  }
};

const getTanamanPetani = async (req, res) => {
  try {
    const data = await tanamanPetani.findAll({
      include: [
        {
          model: dataPetani,
          include: [
            {
              model: kelompok,
            },
          ],
        },
      ],
    });
    res.status(200).json({
      message: "Berhasil mendapatkan data tanaman petani",
      data,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: error.message,
    });
  }
};

const getTanamanPetaniById = async (req, res) => {
  const { id } = req.params;
  try {
    const data = await tanamanPetani.findOne({
      where: {
        id,
      },
    });
    res.status(200).json({
      message: "Data laporan Tani Berhasil Diperoleh",
      tani: data,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: error.message,
    });
  }
};

const deleteTanamanPetaniById = async (req, res) => {
  const { id } = req.params;
  try {
    const data = await tanamanPetani.findOne({
      where: {
        id,
      },
    });
    if (!data) throw new ApiError(400, "data tidak ditemukan.");
    await tanamanPetani.destroy({
      where: {
        id,
      },
    });
    res.status(200).json({
      message: "Tanaman Petani Berhasil Di Hapus",
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: `gagal menghapus data Tanaman petani`,
    });
  }
};

module.exports = {
  laporanPetani,
  laporanPenyuluh,
  tambahDaftarTani,
  tambahLaporanTani,
  daftarTani,
  deleteDaftarTani,
  dataTaniDetail,
  updateTaniDetail,
  getLaporanPetani,
  getTanamanPetani,
  tambahTanamanPetani,
  getTanamanPetaniById,
  ubahTanamanPetaniById,
  deleteTanamanPetaniById,
};
