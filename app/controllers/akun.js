const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const {
	tbl_akun: tblAkun,
	dataPerson,
	dataPetani,
	dataPenyuluh,
	kelompok,
	dataOperator,
} = require("../models");
const ApiError = require("../../utils/ApiError");
const isEmailValid = require("../../utils/emailValidation");
const imageKit = require("../../midleware/imageKit");

const crypto = require("crypto");
const { tambahLaporanTani } = require("./dataTani");
const { postActivity } = require("./logActivity");

dotenv.config();

const login = async (req, res) => {
	try {
		const { email = "", password = "" } = req.body;
		const user = await tblAkun.findOne({ where: { email } });
		if (!user) throw new ApiError(400, "Email tidak terdaftar.");
		if (user.peran === "petani") {
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

		postActivity({
			user_id: user.id,
			activity: "REGISTER",
			type: "USER",
			detail_id: user.id,
		});

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
			// const user = await dataPerson.findOne({ where: { NIK } });
			const userPetani = await dataPetani.findOne({ where: { NIK } });
			if (!userPetani) throw new ApiError(400, "NIK tidak terdaftar.");
			// console.log(user);
			const user = await tblAkun.findOne({
				where: { accountID: userPetani.accountID },
			});
			if (!user.isVerified) {
				throw new ApiError(
					400,
					"Akun belum diverifikasi oleh admin, mohon menunggu"
				);
			}
			if (!bcrypt.compareSync(password, userPetani.password)) {
				throw new ApiError(400, "Password salah.");
			}
			if (bcrypt.compareSync(password, userPetani.password)) {
				const token = jwt.sign(
					{
						id: userPetani.id,
						NIK: userPetani.NIK,
					},
					process.env.SECRET_KEY
				);
				return res.status(200).json({
					message: "Login berhasil.",
					token,
					user: userPetani,
				});
			}
		} else if (NIP) {
			const user = await dataPenyuluh.findOne({ where: { NIP } });
			if (!user) throw new ApiError(400, "NIP tidak terdaftar.");
			if (!bcrypt.compareSync(password, user.password)) {
				throw new ApiError(400, "Password salah.");
			}
			if (bcrypt.compareSync(password, user.password)) {
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
		let {
			NIK, // mandatory
			NKK, // not mandatory
			nama, // mandatory
			email, // not mandatory
			alamat, // mandatory
			desa, // mandatory
			kecamatan, // mandatory
			password, // mandatory
			NoWa, // mandatory
			gapoktan, // mandatory
			penyuluh, // mandatory
			namaKelompok, // mandatory
		} = req.body;
		const { file } = req;
		// validasi
		if (!NIK) throw new ApiError(400, "NIK tidak boleh kosong");
		if (!NKK) NKK = NIK;
		if (!nama) throw new ApiError(400, "nama tidak boleh kosong");
		if (!email) email = nama.split(" ")[0] + "@gmail.com";
		if (!alamat) throw new ApiError(400, "Alamat tidak boleh kosong.");
		if (!desa) throw new ApiError(400, "Desa tidak boleh kosong.");
		if (!kecamatan)
			throw new ApiError(400, "Kecamatan tidak boleh kosong.");
		if (!password) throw new ApiError(400, "Password tidak boleh kosong.");
		if (!NoWa) throw new ApiError(400, "no wa tidak boleh kosong.");
		if (!gapoktan) throw new ApiError(400, "Gapoktan tidak boleh kosong.");
		if (!penyuluh) throw new ApiError(400, "Penyuluh tidak boleh kosong.");
		if (!namaKelompok)
			throw new ApiError(400, "nama kelompok tidak boleh kosong.");
		const tani = await dataPetani.findOne({ where: { NIK } });
		if (tani) throw new ApiError(400, "NIK sudah digunakan");

		const hashedPassword = bcrypt.hashSync(password, 10);
		const accountID = crypto.randomUUID();
		let urlImg = "";

		const penyuluhData = await dataPenyuluh.findOne({
			where: { id: penyuluh },
		});

		const kelompokData = await kelompok.findOne({
			where: {
				gapoktan: gapoktan,
				namaKelompok: namaKelompok,
				desa: desa,
			},
		});

		if (!kelompokData)
			throw new ApiError(400, "Kelompok tani tidak ditemukan");

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
		const newUser = await tblAkun.create({
			email: email,
			password: hashedPassword,
			no_wa: NoWa,
			nama,
			pekerjaan: "",
			peran: "petani",
			foto: urlImg,
			accountID,
		});

		const daftarTani = await dataPetani.create({
			nik: NIK,
			nkk: NKK,
			nama,
			foto: urlImg,
			alamat,
			desa,
			kecamatan,
			password: hashedPassword,
			email: email,
			noTelp: NoWa,
			accountID,
			fk_penyuluhId: penyuluhData.id,
			fk_kelompokId: kelompokData.id,
		});

		const token = jwt.sign(
			{
				id: newUser.id,
			},
			process.env.SECRET_KEY
		);

		postActivity({
			user_id: newUser.id,
			activity: "REGISTER",
			type: "USER",
			detail_id: newUser.id,
		});

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

const opsiPenyuluh = async (req, res) => {
	try {
		const dataDaftarPenyuluh = await dataPenyuluh.findAll();
		res.status(200).json({
			message: "Semua Data Penyuluh",
			dataDaftarPenyuluh,
		});
	} catch (error) {
		res.status(error.statusCode || 500).json({
			message: error.message,
		});
	}
};

const opsiPoktan = async (req, res) => {
	try {
		const kelompokTani = await kelompok.findAll();
		res.status(200).json({
			message: "Berhasil Mendapatkan Data Info Tani",
			kelompokTani,
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
							model: tblAkun,
						},
					],
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
			if (lama) {
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
					no_wa: whatsapp || data.no_wa,
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
			if (lama) {
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
					no_wa: whatsapp || data.no_wa,
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
					nkk: nokk || data.nkk,
					nama: nama || data.nama,
					alamat: alamat || data.alamat,
					desa: desa || data.desa,
					kecamatan: kecamatan || data.kecamatan,
					password: baru ? bcrypt.hashSync(baru, 10) : data.password, // Hash password only if provided
					email: email || data.email,
					noTelp: whatsapp || data.noTelp,
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
			const data = await dataOperator.findOne({
				where: {
					accountID,
				},
			});
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
			const accountUpdate = await tblAkun.update(
				{
					email,
					password: baru ? bcrypt.hashSync(baru, 10) : data.password, // Hash password only if provided
					no_wa: whatsapp || data.no_wa,
					nama,
					// pekerjaan: "",
					// peran: "petani",
					foto: urlImg || data.foto,
				},
				{
					where: { accountID: accountID },
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
				operatorUpdate,
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

const getPeran = async (req, res) => {
	const { peran } = req.user || {};
	const { page, limit } = req.query;
	console.log("test");
	try {
		const limitFilter = Number(limit) || 10;
		const pageFilter = Number(page) || 1;
		const query = {
			limit: limitFilter,
			offset: (pageFilter - 1) * limitFilter,
			limit: parseInt(limit),
		};
		const data = await tblAkun.findAll({ ...query });
		// console.log(data);
		const total = await tblAkun.count({ ...query });
		res.status(200).json({
			message: "berhasil",
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
	} catch (error) {
		res.status(error.statusCode || 500).json({
			message: error.message,
		});
	}
};

const ubahPeran = async (req, res) => {
	// const {accountID, peran} = req.user;
	const { id, roles } = req.body;
	// const {id}  = req.query
	console.log({ id });
	console.log({ roles });
	// const { id, peran } = req.body;
	console.log("Halo");
	try {
		const user = await tblAkun.findOne({ where: { id: id } });
		let detailUser;
		if (!user) throw new ApiError(400, "user tidak ditemukan");
		if (user.peran === "petani") {
			detailUser = await dataPetani.findOne({
				where: { accountID: user.accountID },
			});
			await dataPetani.destroy({ where: { accountID: user.accountID } });
		} else if (user.peran === "penyuluh") {
			detailUser = await dataPenyuluh.findOne({
				where: { accountID: user.accountID },
			});
			await dataPenyuluh.destroy({
				where: { accountID: user.accountID },
			});
		} else if (
			user.peran === "operator super admin" ||
			user.peran === "operator admin" ||
			user.peran === "operator poktan"
		) {
			detailUser = await dataOperator.findOne({
				where: { accountID: user.accountID },
			});
			await dataOperator.destroy({
				where: { accountID: user.accountID },
			});
		}
		console.log({ detailUser });
		if (roles === "petani") {
			await dataPetani.create({
				nik: detailUser.nik,
				nama: detailUser.nama,
				email: detailUser.email,
				noTelp: detailUser.noTelp,
				foto: detailUser.foto,
				alamat: detailUser.alamat,
				password: detailUser.password,
				accountID: detailUser.accountID,
			});
		} else if (roles === "penyuluh") {
			await dataPenyuluh.create({
				nik: detailUser.nik,
				nama: detailUser.nama,
				email: detailUser.email,
				noTelp: detailUser.noTelp,
				foto: detailUser.foto,
				alamat: detailUser.alamat,
				password: detailUser.password,
				accountID: detailUser.accountID,
			});
		} else {
			await dataOperator.create({
				nik: detailUser.nik,
				nama: detailUser.nama,
				email: detailUser.email,
				noTelp: detailUser.noTelp,
				foto: detailUser.foto,
				alamat: detailUser.alamat,
				password: detailUser.password,
				accountID: detailUser.accountID,
			});
		}
		await tblAkun.update(
			{ peran: roles },
			{
				where: {
					id,
				},
			}
		);
		return res.status(200).json({
			message: "Peran berhasil diubah",
		});
	} catch (error) {
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
	getPeran,
	ubahPeran,
	opsiPenyuluh,
	opsiPoktan,
};
