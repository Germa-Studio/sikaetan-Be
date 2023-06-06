const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { tbl_akun: tblAkun } = require('../models');
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


module.exports = { login, register };