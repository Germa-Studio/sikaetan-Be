const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const {
  tbl_akun: tblAkun,
  dataPerson,
  dataPetani,
  dataPenyuluh,
  kelompok,
  dataOperator
} = require("../models");
const ApiError = require("../../utils/ApiError");
const isEmailValid = require("../../utils/emailValidation");
const imageKit = require("../../midleware/imageKit");

const crypto = require("crypto");

dotenv.config();

const login = async (req, res) => {
  try {
    const { email = "", password = "" } = req.body;
    const user = await tblAkun.findOne({ where: { email } });
    if (!user) throw new ApiError(400, "Email tidak terdaftar.");
    if (
      user.peran === "petani"
    ) {
      throw new ApiError(403, "Anda tidak memiliki akses");
    }
    if (!bcrypt.compareSync(password, user.password)) {
      throw new ApiError(400, "Password salah.");
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
        message: "Login berhasil.",
        token,
        user,
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
      pekerjaan = "",
      peran = "",
    } = req.body;
    const { file } = req;
    const User = await tblAkun.findOne({ where: { email } });
    // validasi
    const validateEmail = isEmailValid(email);
    if (!email) throw new ApiError(400, "Email tidak boleh kosong.");
    if (!validateEmail) throw new ApiError(400, "Email tidak valid.");
    if (!password) throw new ApiError(400, "Password tidak boleh kosong.");
    if (!nama) throw new ApiError(400, "Nama tidak boleh kosong.");
    if (!no_wa) throw new ApiError(400, "no wa tidak boleh kosong.");
    if (!nama) throw new ApiError(400, "Nama tidak boleh kosong.");
    if (User) throw new ApiError(400, "Email telah terdaftar.");
    if (password.length < 8) {
      throw new ApiError(400, "Masukkan password minimal 8 karakter");
    }
    // hash password
    const hashedPassword = bcrypt.hashSync(password, 10);
    // generate 6digit random number
    const accountID = crypto.randomUUID();
    let urlImg;
    if (file) {
      const validFormat =
        file.mimetype === "image/png" ||
        file.mimetype === "image/jpg" ||
        file.mimetype === "image/jpeg" ||
        file.mimetype === "image/gif";
      if (!validFormat) {
        res.status(400).json({
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
    // buat user baru
    const user = await tblAkun.create({
      email,
      password: hashedPassword,
      no_wa,
      nama,
      pekerjaan,
      peran,
      foto: urlImg,
      accountID: accountID,
    });

    // generate token utk user yg success login
    const token = jwt.sign(
      {
        id: user.id,
      },
      process.env.SECRET_KEY
    );

    res.status(200).json({
      message: "Registrasi berhasil",
      token: token,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: error.message,
    });
  }
};
const loginPetani = async (req, res) => {
  try {
    const { NIK = "", password = "", NIP = "" } = req.body;
    if (NIK && NIP) {
      throw new ApiError(
        400,
        "Login Sebagai Petani NIk Yang Di Isi Atau Login Sebagai Penyuluh NIP Yang D Isi."
      );
    }
    if (NIK) {
      const user = await dataPerson.findOne({ where: { NIK } });
      if (!user) throw new ApiError(400, "NIK tidak terdaftar.");
      if (password != user.password) {
        throw new ApiError(400, "Password salah.");
      }
      if (!user.verify) {
        throw new ApiError(
          400,
          "Akun belum diverifikasi oleh admin, mohon menunggu"
        );
      }
      if (password == user.password) {
        const token = jwt.sign(
          {
            id: user.id,
            NIK: user.NIK,
          },
          process.env.SECRET_KEY
        );
        return res.status(200).json({
          message: "Login berhasil.",
          token,
          user,
        });
      }
    } else if (NIP) {
      const user = await dataPerson.findOne({ where: { NIP } });
      if (!user) throw new ApiError(400, "NIP tidak terdaftar.");
      if (password != user.password) {
        throw new ApiError(400, "Password salah.");
      }
      if (password == user.password) {
        const token = jwt.sign(
          {
            id: user.id,
            NIK: user.NIP,
          },
          process.env.SECRET_KEY
        );
        return res.status(200).json({
          message: "Login berhasil.",
          token,
          user,
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
      NIK = "",
      NoWa,
      alamat,
      desa,
      nama,
      kecamatan,
      password,
    } = req.body;
    const { file } = req;
    // validasi
    if (!NIK) throw new ApiError(400, "NIK tidak boleh kosong");
    if (!nama) throw new ApiError(400, "nama tidak boleh kosong");
    const tani = await dataPerson.findOne({ where: { NIK } });
    if (tani) throw new ApiError(400, "NIK sudah digunakan");
    let urlImg = "";
    if (file) {
      const validFormat =
        file.mimetype === "image/png" ||
        file.mimetype === "image/jpg" ||
        file.mimetype === "image/jpeg" ||
        file.mimetype === "image/gif";
      if (!validFormat) {
        res.status(400).json({
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
    const daftarTani = await dataPerson.create({
      NIK,
      NoWa,
      role: "petani",
      alamat,
      desa,
      nama,
      kecamatan,
      password,
      foto: urlImg,
    });
    const token = jwt.sign(
      {
        id: daftarTani.id,
        NIK: daftarTani.NIK,
      },
      process.env.SECRET_KEY
    );
    res.status(200).json({
      message: "Berhasil Registrasi Silahkan Login",
      user: daftarTani,
      token,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: error.message,
    });
  }
};
const getUserNotVerify = async (req, res) => {
  try {
    const user = await dataPerson.findAll({ where: { verify: false } });
    if (!user) throw new ApiError(400, "user tidak ditemukan");
    return res.status(200).json({
      message: "user belum di verifikasi",
      user,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: error.message,
    });
  }
};
const verifikasi = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await dataPerson.findOne({ where: { id } });
    if (!user) throw new ApiError(400, "user tidak ditemukan");
    await dataPerson.update(
      { verify: true },
      {
        where: {
          id,
        },
      }
    );
    const users = await dataPerson.findOne({ where: { id } });
    return res.status(200).json({
      message: "User berhasil diverifikasi",
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: error.message,
    });
  }
};

const getProfile = async (req, res) => {
  try {
    const bearerToken = req.headers.authorization;
    if (!bearerToken) {
      res.status(401).json({
        status: "failed",
        message: "Required authorization",
      });
    }
    const payload = jwt.verify(bearerToken, process.env.SECRET_KEY);
    if (payload.NIK) {
      dataPerson.findByPk(payload.id).then((instance) => {
        req.user = instance;
        res.status(200).json({
          message: "berhasil",
          user: req.user,
        });
      });
    } else {
      tblAkun.findByPk(payload.id).then((instance) => {
        req.user = instance;
        res.status(200).json({
          message: "berhasil",
          user: req.user,
        });
      });
    }
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: error.message,
    });
  }
};

const getDetailProfile = async (req, res) => {
  try {
    // console log req.user
    // console.log({req.user});
    const { accountID, peran } = req.user;
    if (accountID) {
      let data;
      if (peran === "penyuluh") {
        data = await dataPenyuluh.findOne({
          where: { accountID: accountID },
          include: [
            {
              model: tblAkun,
            },
          ],
        });
      } else if (peran === "petani") {
        data = await dataPetani.findOne({
          where: { accountID: accountID },
          include: [
            {
              model: tblAkun,
            },
            {
              model: kelompok,
              attributes: {
                exclude: ["createdAt", "updatedAt"],
              },
            },
            {
              model: dataPenyuluh,
              attributes: {
                exclude: ["createdAt", "updatedAt"],
              },
            },
          ],
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
        message: "berhasil",
        data,
      });
    }
  } catch (error) {
    console.error(error); // Log the error for debugging
    res.status(error.statusCode || 500).json({
      message: error.message,
    });
  }
};

const updateDetailProfile = async (req, res) => {
  const { accountID, peran } = req.user;
  try {
    // console.log(req.user);
    if (peran === "penyuluh") {
      const {
        nik,
        email,
        whatsapp,
        alamat,
        desa,
        nama,
        kecamatan,
        lama,
        baru,
        namaProduct,
        kecamatanBinaan,
        desaBinaan,
        fotoProfil,
      } = req.body;
      // console.log({req})
      // console.log({fotoProfil})
      const data = await dataPenyuluh.findOne({
        where: {
          accountID,
        },
      });
      if (!data) throw new ApiError(400, "data tidak ditemukan.");
      if(lama){
        if (!bcrypt.compareSync(lama, data.password)) {
          throw new ApiError(400, "Password salah.");
        }
      }
      let urlImg;
      const { file } = req;
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
      
      // const hashedPassword = bcrypt.hashSync(password, 10);
      // decrypt password
      const accountUpdate = await tblAkun.update(
        {
          email: email || data.email,
          password: baru ? bcrypt.hashSync(baru, 10) : data.password, // Hash password only if provided
          no_Wa: whatsapp || data.no_wa,
          nama: nama || data.nama,
          // pekerjaan: "",
          // peran: "penyuluh",
          foto: urlImg || data.foto,
        },
        {
          where: { accountID: accountID },
        }
      );
      const newDataPenyuluh = await dataPenyuluh.update(
        {
          nik: nik || data.nik,
          email: email || data.email,
          noTelp: whatsapp || data.noTelp,
          alamat: alamat || data.alamat,
          desa: desa || data.desa,
          nama: nama || data.nama,
          kecamatan: kecamatan || data.kecamatan,
          password: baru ? bcrypt.hashSync(baru, 10) : data.password, // Hash password only if provided
          namaProduct: namaProduct || data.namaProduct,
          kecamatanBinaan: kecamatanBinaan || data.kecamatanBinaan,
          desaBinaan: desaBinaan || data.desaBinaan,
          foto: urlImg || data.foto,
        },
        {
          where: {
            accountID: accountID,
          },
        }
      );
      res.status(200).json({
        message: "Berhasil Mengubah Profil",
        newDataPenyuluh,
        accountUpdate,
      });
    } else if (peran === "petani") {
      const {
        nik,
        nokk,
        email,
        whatsapp,
        alamat,
        desa,
        nama,
        kecamatan,
        lama,
        baru,
        foto,
      } = req.body;
      const data = await dataPetani.findOne({
        where: {
          accountID,
        },
      });
      if(lama){
        if (!bcrypt.compareSync(lama, data.password)) {
          throw new ApiError(400, "Password salah.");
        }
      }
      let urlImg;
      const { file } = req;
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
      const accountUpdate = await tblAkun.update(
        {
          email,
          password: baru ? bcrypt.hashSync(baru, 10) : data.password, // Hash password only if provided
          no_wa: no_wa,
          nama,
          // pekerjaan: "",
          // peran: "petani",
          foto: urlImg || data.foto,
        },
        {
          where: { accountID: accountID },
        }
      );
      const petaniUpdate = await dataPetani.update(
        {
          nik: nik || data.nik,
          nkk: nokk || data.nokk,
          nama: nama || data.nama,
          alamat: alamat || data.alamat,
          desa: desa || data.desa,
          kecamatan : kecamatan || data.kecamatan,
          password: baru ? bcrypt.hashSync(baru, 10) : data.password, // Hash password only if provided
          email: email || data.email,
          noTelp: whatsapp ||  data.noTelp
        },
        {
          where: { accountID: accountID },
        }
      );
      res.status(200).json({
        message: "Berhasil Mengubah Profil",
        petaniUpdate,
        accountUpdate,
      });
    } else {
      const {
        email,
        no_wa,
        nama,
        password,
        pekerjaan = "",
        peran = "",
      } = req.body;
      let urlImg;
      const { file } = req;
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
          no_wa,
          nama,
          pekerjaan: "",
          peran: "petani",
          foto: urlImg,
        },
        {
          where: { accountID: accountID },
        }
      );
      res.status(200).json({
        message: "Berhasil Mengubah Profil",
        accountUpdate,
      });
    }
  } catch (error) {
    console.error(error); // Log the error for debugging
    res.status(error.statusCode || 500).json({
      message: error.message,
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
};
