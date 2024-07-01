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
//import crypto
const crypto = require("crypto");
const ExcelJS = require("exceljs");
const { postActivity } = require("./logActivity");

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
	try {
		// if (peran === "petani") {
		// 	throw new ApiError(400, "Anda tidak memiliki akses.");
		// } else {
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

			if (!NIK) {
				throw new ApiError(400, "NIK tidak boleh kosong");
			}
			if (!nama) {
				throw new ApiError(400, "nama tidak boleh kosong");
			}
			if (!penyuluh) {
				throw new ApiError(400, "penyuluh tidak boleh kosong");
			}
			const tani = await dataPetani.findOne({ where: { nik: NIK } });
			if (tani) {
				throw new ApiError(400, "NIK sudah digunakan");
			}
			const { file } = req;
			const penyuluhData = await dataPenyuluh.findOne({
				where: { id: penyuluh },
			});
			const hashedPassword = bcrypt.hashSync(password, 10);
			const accountID = crypto.randomUUID();
			const kelompokData = await kelompok.findOne({
				where: {
					gapoktan: gapoktan,
					namaKelompok: namaKelompok,
					desa: desa,
				},
			});
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
			}
			const newAccount = await tbl_akun.create({
				email,
				password: hashedPassword,
				no_wa: NoWa,
				nama,
				pekerjaan: "",
				peran: "petani",
				foto: urlImg,
				accountID: accountID,
			});
			const daftarPetani = await dataPetani.create({
				nik: NIK,
				nkk: nokk,
				foto: urlImg,
				nama,
				alamat,
				desa,
				kecamatan,
				password: hashedPassword,
				email,
				noTelp: NoWa,
				accountID: accountID,
				fk_penyuluhId: penyuluhData.id,
				fk_kelompokId: kelompokData.id,
			});

			postActivity({
				user_id: id,
				activity: "CREATE",
				type: "DATA PETANI",
				detail_id: daftarPetani.id,
			});

			res.status(200).json({
				message: "Berhasil Menambahakan Daftar Tani",
				daftarPetani,
				newAccount,
			});
		// }
	} catch (error) {
		res.status(error.statusCode || 500).json({
			message: error.message,
		});
	}
};

const uploadDataPetani = async (req, res) => {
	const { peran, id } = req.user || {};

	try {
		if (
			peran === "petani"
		) {
			throw new ApiError(403, "Anda tidak memiliki akses.");
		}

		const { file } = req;
		if (!file) throw new ApiError(400, "File tidak ditemukan.");

		const workbook = new ExcelJS.Workbook();
		await workbook.xlsx.load(file.buffer);

		const worksheet = workbook.getWorksheet(1);

		worksheet.eachRow({ includeEmpty: true }, async (row, rowNumber) => {
			if (rowNumber === 1) return;
			const nikPenyuluh = row.getCell(1).value.toString(); // Fix variable name
			const penyuluh = await dataPenyuluh.findOne({ where: { nik: nikPenyuluh } });
			const accountID = crypto.randomUUID();
			const password = row.getCell(10).value.toString();
			const hashedPassword = bcrypt.hashSync(password, 10);
			const kelompokData = await kelompok.findOne({
				where: {
					gapoktan: row.getCell(11).value.toString(),
					namaKelompok: row.getCell(12).value.toString(),
					desa: row.getCell(6).value.toString(),
				},
			});
			//default url image
			const urlImg =
				"https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/images/bg-7.png";
			if (penyuluh) {
				const newPetani = await dataPetani.create({
					nik: row.getCell(2).value.toString(),
					nkk: row.getCell(3).value.toString(),
					nama: row.getCell(4).value.toString(),
					alamat: row.getCell(5).value.toString(),
					desa: row.getCell(6).value.toString(),
					kecamatan: row.getCell(7).value.toString(),
					foto: urlImg,
					noTelp: row.getCell(8).value.toString(),
					email: row.getCell(9).value.toString(),
					password: hashedPassword,
					accountID: accountID,
					fk_penyuluhId: penyuluh.id,
					fk_kelompokId: kelompokData.id,
				});

				await tbl_akun.create({
					email: row.getCell(9).value.toString(),
					password: hashedPassword,
					no_wa: row.getCell(8).value.toString(),
					nama: row.getCell(4).value.toString(),
					pekerjaan: "",
					peran: "petani",
					foto: urlImg,
					accountID: accountID,
				});

				postActivity({
					user_id: id,
					activity: "CREATE",
					type: "DATA PETANI",
					detail_id: newPetani.id,
				});
			} else {
				console.error(
					`Penyuluh dengan NIK ${nikPenyuluh} tidak ditemukan.`
				);
			}
		});
		res.status(201).json({
			message: "Data berhasil ditambahkan.",
		});
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
	const { peran } = req.user || {};
	const { page, limit, verified } = req.query;
	try {
		if (peran === "petani") {
			throw new ApiError(400, "Anda tidak memiliki akses.");
		}
		const limitFilter = Number(limit) || 10;
		const pageFilter = Number(page) || 1;
		const whereFilter =
			verified === ""
				? {}
				: {
						"$tbl_akun.isVerified$": {
							[Op.eq]: verified === "true" ? 1 : 0,
						},
				  };

		const query = {
			include: [
				{
					model: kelompok,
				},
				{
					model: dataPenyuluh,
				},
				{
					model: tbl_akun,
				},
			],
			limit: limitFilter,
			offset: (pageFilter - 1) * limitFilter,
			limit: parseInt(limit),
			where: whereFilter,
		};

		const data = await dataPetani.findAll({ ...query });
		const total = await dataPetani.count({ ...query });
		res.status(200).json({
			message: "Data laporan Tani Berhasil Diperoleh",
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

const deleteDaftarTani = async (req, res) => {
	const { id } = req.params;
	const { peran, id: UserId } = req.user;
	try {
		if (peran !== "operator super admin") {
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
				where: {
					accountID: data.accountID,
				},
			});
			postActivity({
				user_id: UserId,
				activity: "DELETE",
				type: "DATA PETANI",
				detail_id: id,
			});
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
				id: id,
			},
			include: [
				{
					model: kelompok,
				},
				{
					model: dataPenyuluh,
				},
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
	const { peran, id: UserId } = req.user;
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
    if (peran === "petani") {
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
          gapoktan: gapoktan,
          namaKelompok: namaKelompok,
          desa: desa,
        },
      });
      const penyuluhData = await dataPenyuluh.findOne({
        where: {
          id: penyuluh,
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
			const hashedPassword = bcrypt.hashSync(password, 10);
			const accountUpdate = await tbl_akun.update(
				{
					email,
					password: hashedPassword,
					no_wa: NoWa,
					nama,
					pekerjaan: "",
					peran: "petani",
					foto: urlImg,
				},
				{
					where: { accountID: data.accountID },
				}
			);
			const petaniUpdate = await dataPetani.update(
				{
					nik: NIK,
					nkk: nokk,
					foto: urlImg,
					nama,
					alamat,
					desa,
					kecamatan,
					password: hashedPassword,
					email,
					noTelp: NoWa,
					fk_penyuluhId: penyuluhData.id,
					fk_kelompokId: kelompokData.id,
				},
				{
					where: { id },
				}
			);
			postActivity({
				user_id: UserId,
				activity: "EDIT",
				type: "DATA PETANI",
				detail_id: id,
			});
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
		const {} = req.body;
		const { id: UserId } = req.user;

		for (const key in req.body) {
			if (!req.body[key] && key != "jenis" && key != "jenisPanen") {
				throw new ApiError(400, `${key} harus di isi`);
			}
		}
		const data = await dataPetani.findOne({
			where: {
				id: UserId,
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
			UserId,
			statusLahan,
			luasLahan,
		});

		postActivity({
			user_id: UserId,
			activity: "CREATE",
			type: "TANAMAN PETANI",
			detail_id: dataTanamanPetani.id,
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
		const { peran, id: UserId } = req.user || {};
		if (peran === "petani") {
			throw new ApiError(400, "Anda tidak memiliki akses.");
		}
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

		postActivity({
			user_id: UserId,
			activity: "EDIT",
			type: "TANAMAN PETANI",
			detail_id: id,
		});

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
		const { peran } = req.user || {};
		if (peran === "petani") {
			throw new ApiError(400, "Anda tidak memiliki akses.");
		}
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
		const { peran } = req.user || {};
		if (peran === "petani") {
			throw new ApiError(400, "Anda tidak memiliki akses.");
		}
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
	const { peran, id: UserId } = req.user;
	try {
		const { peran } = req.user || {};
		if (
			peran === "petani" ||
			peran === "penyuluh" ||
			peran === "operator poktan"
		) {
			throw new ApiError(400, "Anda tidak memiliki akses.");
		}
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
		postActivity({
			user_id: UserId,
			activity: "DELETE",
			type: "TANAMAN PETANI",
			detail_id: id,
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
	uploadDataPetani,
};
