const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const {
  tbl_akun: tblAkun,
  dataPerson,
  dataPetani,
  dataPenyuluh,
  kelompok,
  dataOperator,
  kecamatan,
  desa,
  kecamatanBinaan,
  desaBinaan
} = require('../models');
const ApiError = require('../../utils/ApiError');
const isEmailValid = require('../../utils/emailValidation');
const imageKit = require('../../midleware/imageKit');
const { Op, col } = require('sequelize');

const crypto = require('crypto');
const { postActivity } = require('./logActivity');

dotenv.config();

const login = async (req, res) => {
  try {
    const { email = '', password = '' } = req.body;
    const user = await tblAkun.findOne({ where: { email } });
    if (!user) throw new ApiError(400, 'Email tidak terdaftar.');
    if (user.peran === 'petani') {
      throw new ApiError(403, 'Anda tidak memiliki akses');
    }
    if (!bcrypt.compareSync(password, user.password)) {
      throw new ApiError(400, 'Password salah.');
    }

    if (bcrypt.compareSync(password, user.password)) {
      // generate token utk user yg success login
      const token = jwt.sign(
        {
          id: user.id
        },
        process.env.SECRET_KEY
      );
      res.status(200).json({
        message: 'Login berhasil.',
        token,
        user
      });
    }
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: error.message
    });
  }
};

const register = async (req, res) => {
  try {
    const { email, no_wa, nama, password, pekerjaan = '', peran = '' } = req.body;
    const { file } = req;
    const User = await tblAkun.findOne({ where: { email } });
    // validasi
    const validateEmail = isEmailValid(email);
    if (!email) throw new ApiError(400, 'Email tidak boleh kosong.');
    if (!validateEmail) throw new ApiError(400, 'Email tidak valid.');
    if (!password) throw new ApiError(400, 'Password tidak boleh kosong.');
    if (!nama) throw new ApiError(400, 'Nama tidak boleh kosong.');
    if (!no_wa) throw new ApiError(400, 'no wa tidak boleh kosong.');
    if (!nama) throw new ApiError(400, 'Nama tidak boleh kosong.');
    if (User) throw new ApiError(400, 'Email telah terdaftar.');
    if (password.length < 8) {
      throw new ApiError(400, 'Masukkan password minimal 8 karakter');
    }
    // hash password
    const hashedPassword = bcrypt.hashSync(password, 10);
    // generate 6digit random number
    const accountID = crypto.randomUUID();
    let urlImg;
    if (file) {
      const validFormat =
        file.mimetype === 'image/png' ||
        file.mimetype === 'image/jpg' ||
        file.mimetype === 'image/jpeg' ||
        file.mimetype === 'image/gif';
      if (!validFormat) {
        res.status(400).json({
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
    // buat user baru
    const user = await tblAkun.create({
      email,
      password: hashedPassword,
      no_wa,
      nama,
      pekerjaan,
      peran,
      foto: urlImg,
      accountID: accountID
    });

    // generate token utk user yg success login
    const token = jwt.sign(
      {
        id: user.id
      },
      process.env.SECRET_KEY
    );

    postActivity({
      user_id: user.id,
      activity: 'REGISTER',
      type: 'USER',
      detail_id: user.id
    });

    res.status(200).json({
      message: 'Registrasi berhasil',
      token: token
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: error.message
    });
  }
};
const loginPetani = async (req, res) => {
  try {
    const { NIK = '', password = '', NIP = '' } = req.body;
    if (NIK && NIP) {
      throw new ApiError(
        400,
        'Masukkan NIK untuk Petani atau NIP untuk Penyuluh, tidak bisa keduanya.'
      );
    }
    if (NIK) {
      const userPetani = await dataPetani.findOne({ where: { NIK } });
      if (!userPetani) throw new ApiError(400, 'NIK tidak terdaftar.');
      const user = await tblAkun.findOne({
        where: { accountID: userPetani.accountID }
      });

      if (!user.isVerified) {
        throw new ApiError(400, 'Akun belum diverifikasi oleh admin, mohon menunggu');
      }
      if (!bcrypt.compareSync(password, userPetani.password)) {
        throw new ApiError(400, 'Password salah.');
      }
      if (bcrypt.compareSync(password, userPetani.password)) {
        const token = jwt.sign(
          {
            id: user.id
          },
          process.env.SECRET_KEY
        );
        return res.status(200).json({
          message: 'Login berhasil.',
          token,
          user: userPetani
        });
      }
    } else if (NIP) {
      const userPenyuluh = await dataPenyuluh.findOne({ where: { nik: NIP } });
      if (!userPenyuluh) throw new ApiError(400, 'NIP tidak terdaftar.');
      if (!bcrypt.compareSync(password, userPenyuluh.password)) {
        throw new ApiError(400, 'Password salah.');
      }

      const user = await tblAkun.findOne({
        where: { accountID: userPenyuluh.accountID }
      });
      if (bcrypt.compareSync(password, userPenyuluh.password)) {
        const token = jwt.sign(
          {
            id: user.id
          },
          process.env.SECRET_KEY
        );
        return res.status(200).json({
          message: 'Login berhasil.',
          token,
          user: userPenyuluh
        });
      }
    } else {
      throw new ApiError(400, 'NIK atau NIP tidak boleh kosong.');
    }
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: error.message
    });
  }
};

const registerPetani = async (req, res) => {
  try {
    let {
      NIK, // mandatory
      NKK, // not mandatory
      nama, // mandatory
      email, // not mandatory
      alamat, // mandatory
      desa: inputDesa, // mandatory
      desaId,
      kecamatan: inputKecamatan, // mandatory
      kecamatanId,
      password, // mandatory
      NoWa, // mandatory
      gapoktan, // mandatory
      penyuluh, // mandatory
      namaKelompok // mandatory
    } = req.body;
    const { file } = req;
    // validasi
    if (!NIK) throw new ApiError(400, 'NIK tidak boleh kosong');
    if (!NKK) NKK = NIK;
    if (!nama) throw new ApiError(400, 'nama tidak boleh kosong');
    if (!email) email = nama.split(' ')[0] + '@gmail.com';
    if (!alamat) throw new ApiError(400, 'Alamat tidak boleh kosong.');
    if (!inputDesa && !desaId) throw new ApiError(400, 'Desa tidak boleh kosong.');
    if (!inputKecamatan && !kecamatanId) throw new ApiError(400, 'Kecamatan tidak boleh kosong.');
    if (!password) throw new ApiError(400, 'Password tidak boleh kosong.');
    if (!NoWa) throw new ApiError(400, 'no wa tidak boleh kosong.');
    if (!gapoktan) throw new ApiError(400, 'Gapoktan tidak boleh kosong.');
    if (!penyuluh) throw new ApiError(400, 'Penyuluh tidak boleh kosong.');
    if (!namaKelompok) throw new ApiError(400, 'nama kelompok tidak boleh kosong.');
    const tani = await dataPetani.findOne({ where: { NIK } });
    if (tani) throw new ApiError(400, 'NIK sudah digunakan');

    const hashedPassword = bcrypt.hashSync(password, 10);
    const accountID = crypto.randomUUID();
    let urlImg = '';

    const penyuluhData = await dataPenyuluh.findOne({
      where: { id: penyuluh }
    });

    const kelompokData = await kelompok.findOne({
      where: {
        gapoktan: gapoktan,
        namaKelompok: namaKelompok,
        desa: inputDesa
      }
    });

    if (!kelompokData) throw new ApiError(400, 'Kelompok tani tidak ditemukan');

    if (file) {
      const validFormat =
        file.mimetype === 'image/png' ||
        file.mimetype === 'image/jpg' ||
        file.mimetype === 'image/jpeg' ||
        file.mimetype === 'image/gif';
      if (!validFormat) {
        res.status(400).json({
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
    const newUser = await tblAkun.create({
      email: email,
      password: hashedPassword,
      no_wa: NoWa,
      nama,
      pekerjaan: '',
      peran: 'petani',
      foto: urlImg,
      accountID
    });

    let kecamatanData;
    if (!kecamatanId) {
      kecamatanData = await kecamatan.findOne({
        where: { nama: inputKecamatan }
      });

      if (!kecamatanData) {
        return res.status(400).json({
          message: 'Kecamatan tidak ditemukan'
        });
      }
    }
    let desaData;
    if (!desaId) {
      desaData = await desa.findOne({
        where: {
          nama: inputDesa,
          kecamatanId: kecamatanData.id ?? kecamatanId
        }
      });

      if (!desaData) {
        return res.status(400).json({
          message: 'Desa tidak ditemukan'
        });
      }
    }

    const daftarTani = await dataPetani.create({
      nik: NIK,
      nkk: NKK,
      nama,
      foto: urlImg,
      alamat,
      desa: inputDesa,
      kecamatan: inputKecamatan,
      password: hashedPassword,
      email: email,
      noTelp: NoWa,
      accountID,
      fk_penyuluhId: penyuluhData.id,
      fk_kelompokId: kelompokData.id,
      kecamatanId: kecamatanId || kecamatanData.id,
      desaId: desaId || desaData.id
    });

    const token = jwt.sign(
      {
        id: newUser.id
      },
      process.env.SECRET_KEY
    );

    postActivity({
      user_id: newUser.id,
      activity: 'REGISTER',
      type: 'USER',
      detail_id: newUser.id
    });

    res.status(200).json({
      message: 'Berhasil Registrasi Silahkan Login',
      user: daftarTani,
      token
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
      message: 'Semua Data Penyuluh',
      dataDaftarPenyuluh
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: error.message
    });
  }
};

const opsiPoktan = async (req, res) => {
  try {
    const kelompokTani = await kelompok.findAll();
    res.status(200).json({
      message: 'Berhasil Mendapatkan Data Info Tani',
      kelompokTani
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: error.message
    });
  }
};

const getUserNotVerify = async (req, res) => {
  const { peran } = req.user || {};
  const { page, limit } = req.query;

  try {
    if (!peran) {
      throw new ApiError(403, 'Anda tidak memiliki akses.');
    } else {
      const limitFilter = Number(limit) || 10;
      const pageFilter = Number(page) || 1;

      const query = {
        where: { verify: false },
        limit: limitFilter,
        offset: (pageFilter - 1) * limitFilter
      };

      const data = await dataPerson.findAll(query);
      const total = await dataPerson.count({ where: { verify: false } });

      res.status(200).json({
        message: 'Data User Berhasil Diperoleh',
        data,
        total,
        currentPages: pageFilter,
        limit: limitFilter,
        maxPages: Math.ceil(total / limitFilter),
        from: (pageFilter - 1) * limitFilter + 1,
        to: (pageFilter - 1) * limitFilter + data.length
      });
    }
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: error.message
    });
  }
};

const verifikasi = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await tblAkun.findOne({ where: { id } });
    if (!user) throw new ApiError(400, 'user tidak ditemukan');
    await tblAkun.update(
      { isVerified: true },
      {
        where: {
          id
        }
      }
    );

    return res.status(200).json({
      message: 'User berhasil diverifikasi'
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: error.message
    });
  }
};

const getProfile = async (req, res) => {
  try {
    const bearerToken = req.headers.authorization;
    if (!bearerToken) {
      return res.status(401).json({
        status: 'failed',
        message: 'Required authorization'
      });
    }
    const payload = jwt.verify(bearerToken, process.env.SECRET_KEY);
    const user = await tblAkun.findByPk(payload.id);

    let role;

    if (user.peran === 'petani') {
      role = await dataPetani.findOne({
        where: { accountID: user.accountID },
        include: [
          {
            model: dataPenyuluh,
            attributes: {
              exclude: ['createdAt', 'updatedAt', 'password']
            }
          },
          { model: kecamatan, as: 'kecamatanData' },
          { model: desa, as: 'desaData' }
        ],
        attributes: {
          exclude: ['createdAt', 'updatedAt', 'password']
        }
      });
    } else {
      role = await dataPenyuluh.findOne({
        where: { accountID: user.accountID },
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
    }

    return res.status(200).json({
      message: 'berhasil',
      userAccount: user,
      userRole: role
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: error.message
    });
  }
};

const getDetailProfile = async (req, res) => {
  try {
    const { accountID, peran } = req.user;
    if (accountID) {
      let data;
      if (peran === 'penyuluh') {
        data = await dataPenyuluh.findOne({
          where: { accountID: accountID },
          include: [
            {
              model: tblAkun
            },
            {
              model: kecamatan,
              as: 'kecamatanData'
            },
            {
              model: desa,
              as: 'desaData'
            },
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
      } else if (peran === 'petani') {
        data = await dataPetani.findOne({
          where: { accountID: accountID },
          include: [
            {
              model: tblAkun
            },
            {
              model: kelompok,
              attributes: {
                exclude: ['createdAt', 'updatedAt']
              }
            },
            {
              model: dataPenyuluh,
              attributes: {
                exclude: ['createdAt', 'updatedAt']
              }
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
        });
      } else {
        data = await dataOperator.findOne({
          where: { accountID: accountID },
          include: [
            {
              model: tblAkun
            }
          ]
        });
      }
      res.status(200).json({
        message: 'berhasil',
        data
      });
    }
  } catch (error) {
    console.error(error); // Log the error for debugging
    res.status(error.statusCode || 500).json({
      message: error.message
    });
  }
};

const updateDetailProfile = async (req, res) => {
  const { accountID, peran } = req.user;

  try {
    if (peran === 'penyuluh') {
      const {
        nik,
        email,
        whatsapp,
        alamat,
        desa: inputDesa,
        desaId,
        nama,
        kecamatan: inputKecamatan,
        kecamatanId,
        password,
        passwordBaru,
        namaProduct,
        kecamatanBinaan,
        desaBinaan
      } = req.body;
      const data = await dataPenyuluh.findOne({
        where: {
          accountID
        }
      });
      if (!data) throw new ApiError(400, 'data tidak ditemukan.');
      if (password) {
        if (!bcrypt.compareSync(password, data.password)) {
          throw new ApiError(400, 'Password salah.');
        }
      }
      let urlImg;
      const { file } = req;
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

      const accountUpdate = await tblAkun.update(
        {
          email: email || data.email,
          password: passwordBaru ? bcrypt.hashSync(passwordBaru, 10) : data.password, // Hash password only if provided
          no_wa: whatsapp || data.no_wa,
          nama: nama || data.nama,
          foto: urlImg || data.foto
        },
        {
          where: { accountID: accountID }
        }
      );
      let kecamatanData;
      if (!kecamatanId) {
        kecamatanData = await kecamatan.findOne({
          where: { nama: inputKecamatan || data.kecamatan }
        });
        if (!kecamatanData) {
          return res.status(400).json({
            message: 'Kecamatan tidak ditemukan'
          });
        }
      }
      let desaData;
      if (!desaId) {
        desaData = await desa.findOne({
          where: {
            nama: inputDesa || data.desa,
            kecamatanId: kecamatanId || kecamatanData.id
          }
        });
        if (!desaData) {
          return res.status(400).json({
            message: 'Desa tidak ditemukan'
          });
        }
      }
      const newDataPenyuluh = await dataPenyuluh.update(
        {
          nik: nik || data.nik,
          email: email || data.email,
          noTelp: whatsapp || data.noTelp,
          alamat: alamat || data.alamat,
          desa: inputDesa || data.desa,
          nama: nama || data.nama,
          kecamatan: inputKecamatan || data.kecamatan,
          password: passwordBaru ? bcrypt.hashSync(passwordBaru, 10) : data.password, // Hash password only if provided
          namaProduct: namaProduct || data.namaProduct,
          kecamatanBinaan: kecamatanBinaan || data.kecamatanBinaan,
          desaBinaan: desaBinaan || data.desaBinaan,
          foto: urlImg || data.foto,
          kecamatanId: kecamatanId || kecamatanData.id,
          desaId: desaId || desaData.id
        },
        {
          where: {
            accountID: accountID
          }
        }
      );

      newDataPenyuluh && accountUpdate
        ? res.status(200).json({
            message: 'Berhasil Mengubah Profil'
          })
        : res.status(400).json({
            message: 'Gagal Mengubah Profil'
          });
    } else if (peran === 'petani') {
      const {
        nik,
        nokk,
        email,
        whatsapp,
        alamat,
        desa: inputDesa,
        desaId,
        nama,
        kecamatan: inputKecamatan,
        kecamatanId,
        password,
        passwordBaru
      } = req.body;
      const data = await dataPetani.findOne({
        where: {
          accountID
        }
      });
      if (password) {
        if (!bcrypt.compareSync(password, data.password)) {
          throw new ApiError(400, 'Password salah.');
        }
      }
      let urlImg;
      const { file } = req;
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

      const accountUpdate = await tblAkun.update(
        {
          email,
          password: passwordBaru ? bcrypt.hashSync(passwordBaru, 10) : data.password, // Hash password only if provided
          no_wa: whatsapp || data.no_wa,
          nama,
          // pekerjaan: "",
          // peran: "petani",
          foto: urlImg || data.foto
        },
        {
          where: { accountID: accountID }
        }
      );

      let kecamatanData;
      if (!kecamatanId) {
        kecamatanData = await kecamatan.findOne({
          where: { nama: inputKecamatan || data.kecamatan }
        });

        if (!kecamatanData) {
          return res.status(400).json({
            message: 'Kecamatan tidak ditemukan'
          });
        }
      }
      let desaData;
      if (!desaId) {
        desaData = await desa.findOne({
          where: {
            nama: inputDesa || data.desa,
            kecamatanId: kecamatanData.id ?? data.kecamatanId
          }
        });

        if (!desaData) {
          return res.status(400).json({
            message: 'Desa tidak ditemukan'
          });
        }
      }

      const petaniUpdate = await dataPetani.update(
        {
          nik: nik || data.nik,
          nkk: nokk || data.nkk,
          nama: nama || data.nama,
          alamat: alamat || data.alamat,
          desa: inputDesa || data.desa,
          kecamatan: inputKecamatan || data.kecamatan,
          password: passwordBaru ? bcrypt.hashSync(passwordBaru, 10) : data.password, // Hash password only if provided
          email: email || data.email,
          foto: urlImg || data.foto,
          noTelp: whatsapp || data.noTelp,
          kecamatanId: kecamatanId || kecamatanData.id,
          desaId: desaId || desaData.id
        },
        {
          where: { accountID: accountID }
        }
      );
      petaniUpdate && accountUpdate
        ? res.status(200).json({
            message: 'Berhasil Mengubah Profil'
          })
        : res.status(400).json({
            message: 'Gagal Mengubah Profil'
          });
    } else {
      const { nik, email, whatsapp, alamat, desa, nama, kecamatan, baru } = req.body;
      const data = await dataOperator.findOne({
        where: {
          accountID
        }
      });
      let urlImg;
      const { file } = req;
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
        img.url;
        urlImg = img.url;
      }
      const accountUpdate = await tblAkun.update(
        {
          email,
          password: baru ? bcrypt.hashSync(baru, 10) : data.password, // Hash password only if provided
          no_wa: whatsapp || data.no_wa,
          nama,
          // pekerjaan: "",
          // peran: "petani",
          foto: urlImg || data.foto
        },
        {
          where: { accountID: accountID }
        }
      );
      const operatorUpdate = await dataOperator.update(
        {
          nik: nik || data.nik,
          email: email || data.email,
          noTelp: whatsapp || data.noTelp,
          alamat: alamat || data.alamat,
          desa: desa || data.desa,
          nama: nama || data.nama,
          kecamatan: kecamatan || data.kecamatan,
          password: baru ? bcrypt.hashSync(baru, 10) : data.password, // Hash password only if provided
          foto: urlImg || data.foto
        },
        {
          where: {
            accountID: accountID
          }
        }
      );
      res.status(200).json({
        message: 'Berhasil Mengubah Profil',
        operatorUpdate,
        accountUpdate
      });
    }
  } catch (error) {
    console.error(error); // Log the error for debugging
    res.status(error.statusCode || 500).json({
      message: error.message
    });
  }
};

const getPeran = async (req, res) => {
  const { page, limit } = req.query;
  try {
    const limitFilter = Number(limit) || 10;
    const pageFilter = Number(page) || 1;
    const query = {
      limit: limitFilter,
      offset: (pageFilter - 1) * limitFilter
    };
    const data = await tblAkun.findAll({ ...query });
    const total = await tblAkun.count({ ...query });
    res.status(200).json({
      message: 'berhasil',
      data,
      total,
      currentPages: page,
      limit: Number(limit),
      maxPages: Math.ceil(total / (Number(limit) || 10)),
      from: Number(page) ? (Number(page) - 1) * Number(limit) + 1 : 1,
      to: Number(page) ? (Number(page) - 1) * Number(limit) + data.length : data.length
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: error.message
    });
  }
};

const ubahPeran = async (req, res) => {
  const { id, roles } = req.body;

  try {
    const user = await tblAkun.findOne({ where: { id: id } });
    let detailUser;
    if (!user) throw new ApiError(400, 'user tidak ditemukan');

    // check detail user in every table
    detailUser = await dataPetani.findOne({
      where: { accountID: user.accountID }
    });

    if (!detailUser) {
      detailUser = await dataPenyuluh.findOne({
        where: { accountID: user.accountID }
      });
    }
    if (!detailUser) {
      detailUser = await dataOperator.findOne({
        where: { accountID: user.accountID }
      });
    }

    const jsonDetailUser = JSON.parse(JSON.stringify(detailUser));
    const jsonUser = JSON.parse(JSON.stringify(user));

    const {
      id: unusedId,
      createdAt,
      updatedAt,
      ...payload
    } = {
      ...jsonDetailUser,
      ...jsonUser,
      noTelp: jsonDetailUser?.noTelp || jsonUser.no_wa
    };

    if (roles === 'petani') {
      await dataPetani.destroy({ where: { accountID: user.accountID }, force: true });
      await dataPetani.create(payload);
    } else if (roles === 'penyuluh') {
      await dataPenyuluh.destroy({
        where: { accountID: user.accountID },
        force: true
      });
      await dataPenyuluh.create(payload);
    } else {
      await dataOperator.destroy({
        where: { accountID: user.accountID },
        force: true
      });
      await dataOperator.create(payload);
    }

    await tblAkun.update(
      { peran: roles },
      {
        where: {
          id
        }
      }
    );

    if (user.peran === 'petani') {
      await dataPetani.destroy({ where: { accountID: user.accountID } });
    } else if (user.peran === 'penyuluh') {
      await dataPenyuluh.destroy({
        where: { accountID: user.accountID }
      });
    } else if (
      user.peran === 'operator super admin' ||
      user.peran === 'operator admin' ||
      user.peran === 'operator poktan'
    ) {
      await dataOperator.destroy({
        where: { accountID: user.accountID }
      });
    }

    return res.status(200).json({
      message: 'Peran berhasil diubah'
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
      const data = await dataPetani.findAll({
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
        message: 'Berhasil mendapatkan data petani',
        data
      });
    }

    if (debug) {
      const data = await dataPetani.findAll({
        where: {
          kecamatan: {
            [Op.like]: `%${wrongKecamatan}%`
          }
        }
      });

      return res.status(200).json({
        message: 'Berhasil mendapatkan data petani',
        data
      });
    }

    if (correctKecamatan) {
      await dataPetani.update(
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

        await dataPetani.update(
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
      const data = await dataPetani.findAll({
        where: {
          [Op.and]: [
            { desa: { [Op.not]: null } },
            { desaId: null },
            kecamatanId ? { kecamatanId } : {}
          ]
        }
      });
      return res.status(200).json({
        message: 'Berhasil mendapatkan data petani',
        data
      });
    }

    if (debug) {
      const data = await dataPetani.findAll({
        where: {
          desa: {
            [Op.like]: `%${wrongDesa}%`
          }
        }
      });

      return res.status(200).json({
        message: 'Berhasil mendapatkan data petani',
        data
      });
    }

    if (updateEmpty) {
      await dataPetani.update(
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
      await dataPetani.update(
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

        await dataPetani.update(
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
  login,
  register,
  loginPetani,
  registerPetani,
  getUserNotVerify,
  verifikasi,
  getProfile,
  getDetailProfile,
  updateDetailProfile,
  getPeran,
  ubahPeran,
  opsiPenyuluh,
  opsiPoktan,
  changeKecamatanToId,
  changeDesaToId
};
