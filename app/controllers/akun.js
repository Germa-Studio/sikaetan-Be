const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { tbl_akun: tblAkun, dataPerson } = require('../models');
const ApiError = require('../../utils/ApiError');
const isEmailValid = require('../../utils/emailValidation');
const imageKit = require('../../midleware/imageKit');

dotenv.config();

const login = async (req, res) => {
  try {
    const { email = '', password = '', } = req.body;
    const user = await tblAkun.findOne({ where: { email, }, });
    if (!user) throw new ApiError(400, 'Email tidak terdaftar.');
    if (!bcrypt.compareSync(password, user.password)) {
      throw new ApiError(400, 'Password salah.');
    }

    if (bcrypt.compareSync(password, user.password)) {
      // generate token utk user yg success login
      const token = jwt.sign(
        {
          id: user.id,
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
      message: error.message,
    });
  }
};

const register = async (req, res) => {
  try {
    const {
    email,
    no_wa,
    nama,
    password,
    pekerjaan="",
    peran="",
    } = req.body;
    const { file, } = req;
    const User = await tblAkun.findOne({ where: { email, }, });
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
    let urlImg
    if (file) {
      const validFormat =
        file.mimetype === 'image/png' ||
        file.mimetype === 'image/jpg' ||
        file.mimetype === 'image/jpeg' ||
        file.mimetype === 'image/gif';
      if (!validFormat) {
        res.status(400).json({
          status: 'failed',
          message: 'Wrong Image Format',
        });
      }
      const split = file.originalname.split('.');
      const ext = split[split.length - 1];

      // upload file ke imagekit
      const img = await imageKit.upload({
        file: file.buffer,
        fileName: `IMG-${Date.now()}.${ext}`,
      });
      urlImg = img.url
    }
    // buat user baru
    const user = await tblAkun.create({
      email,
      password: hashedPassword,
      no_wa,
      nama,
      pekerjaan,
      peran,
      foto: `${file ? urlImg : ''}`,
    });

    // generate token utk user yg success login
    const token = jwt.sign(
      {
        id: user.id,
      },
      process.env.SECRET_KEY
    );

    res.status(200).json({
      message:'Registrasi berhasil',
      token:token,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: error.message,
    });
  }
};
const loginPetani = async (req, res) => {
  try {
    const { NIK = '', password = '', NIP = '' } = req.body;
    if(NIK && NIP){
      throw new ApiError(400, 'Login Sebagai Petani NIk Yang Di Isi Atau Login Sebagai Penyuluh NIP Yang D Isi.');
    }
    if (NIK) {
      const user = await dataPerson.findOne({ where: { NIK } });
      if (!user) throw new ApiError(400, 'NIK tidak terdaftar.');
      if (password != user.password) {
        throw new ApiError(400, 'Password salah.');
      }
      if(password == user.password){
        const token = jwt.sign(
          {
            id: user.id,
            NIK:user.NIK
          },
          process.env.SECRET_KEY
        );
        return res.status(200).json({
          message: 'Login berhasil.',
          token,
          user
        });
      }
    } else if (NIP) {
      const user = await dataPerson.findOne({ where: { NIP } });
      if (!user) throw new ApiError(400, 'NIP tidak terdaftar.');
      if (password != user.password) {
        throw new ApiError(400, 'Password salah.');
      }
      if(password == user.password){
        const token = jwt.sign(
          {
            id: user.id,
            NIK:user.NIK
          },
          process.env.SECRET_KEY
        );
        return res.status(200).json({
          message: 'Login berhasil.',
          token,
          user
        });
      }
    }
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: error.message,
    });
  }
};

const registerPetani = async (req, res) => {
  try {
    const {
    NIK = '',
    NoWa,
    alamat,
    desa,
    nama,
    kecamatan,
    password,
    } = req.body;
    const { file, } = req;
    // validasi
    if(!NIK) throw new ApiError(400, "NIK tidak boleh kosong")
    if(!nama) throw new ApiError(400, "nama tidak boleh kosong")
    const tani = await dataPerson.findOne({ where: { NIK, }, });
    if(tani) throw new ApiError(400, "NIK sudah digunakan")
    let urlImg = ''
    if (file) {
      const validFormat =
        file.mimetype === 'image/png' ||
        file.mimetype === 'image/jpg' ||
        file.mimetype === 'image/jpeg' ||
        file.mimetype === 'image/gif';
      if (!validFormat) {
        res.status(400).json({
          status: 'failed',
          message: 'Wrong Image Format',
        });
      }
      const split = file.originalname.split('.');
      const ext = split[split.length - 1];

      // upload file ke imagekit
      const img = await imageKit.upload({
        file: file.buffer,
        fileName: `IMG-${Date.now()}.${ext}`,
      });
      urlImg = img.url
    }
    const daftarTani = await dataPerson.create({NIK, NoWa, role:"petani", alamat, desa, nama, kecamatan, password, foto:urlImg })
    const token = jwt.sign(
      {
        id: daftarTani.id,
        NIK:daftarTani.NIK
      },
      process.env.SECRET_KEY
    );
    res.status(200).json({
      message: 'Berhasil Registrasi Silahkan Login',
      user: daftarTani,
      token
    });  
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: error.message,
    });
  }
};

  

module.exports = { login, register, loginPetani, registerPetani, };