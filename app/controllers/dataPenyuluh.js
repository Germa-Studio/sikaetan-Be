const {
	dataPerson,
	dataPenyuluh,
	presesiKehadiran,
	jurnalHarian,
	riwayatChat,
	tbl_akun,
} = require("../models");
const ApiError = require("../../utils/ApiError");
const imageKit = require("../../midleware/imageKit");
const dotenv = require("dotenv");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const ExcelJS = require("exceljs");
const { postActivity } = require("./logActivity");
dotenv.config();
const tambahDataPenyuluh = async (req, res) => {
	const { peran, id } = req.user || {};
	// console.log(peran)
	try {
		if (peran === "petani" || peran === "penyuluh") {
			throw new ApiError(400, "Anda tidak memiliki akses.");
		} else {
			const {
				NIP,
				email,
				NoWa,
				alamat,
				desa,
				nama,
				kecamatan,
				password,
				namaProduct,
				kecamatanBinaan,
				desaBinaan,
				pekerjaan = "",
			} = req.body;

			const hashedPassword = bcrypt.hashSync(password, 10);
			const accountID = crypto.randomUUID();
			const { file } = req;
			const penyuluh = await dataPenyuluh.findOne({
				where: { nik: NIP },
			});
			let urlImg;
			if (!NIP) {
				throw new ApiError(400, "NIP tidak boleh kosong");
			}
			if (!nama) {
				throw new ApiError(400, "nama tidak boleh kosong");
			}
			if (penyuluh) {
				throw new ApiError(400, "NIP sudah digunakan");
			}
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
				try {
					const img = await imageKit.upload({
						file: file.buffer,
						fileName: `IMG-${Date.now()}.${ext}`,
					});
					urlImg = img.url;
				} catch (uploadError) {
					console.error(
						"Error uploading image:",
						uploadError.message
					);
					// Handle the error, and possibly return an error response to the client.
					return res.status(500).json({
						status: "failed",
						message: "Error uploading image.",
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
				peran: "penyuluh",
				foto: urlImg,
				accountID: accountID,
			});

			{
				/* Menambahkan penyuluh yang didaftarkan */
			}
			const newPenyuluh = await dataPenyuluh.create({
				nik: NIP,
				nama: nama,
				foto: urlImg,
				alamat,
				email,
				noTelp: NoWa,
				kecamatan,
				desa,
				password: hashedPassword,
				namaProduct,
				desaBinaan: desaBinaan,
				kecamatanBinaan,
				accountID: accountID,
			});

			postActivity({
				user_id: id,
				activity: "CREATE",
				type: "DATA PENYULUH",
				detail_id: newPenyuluh.id,
			});

			res.status(200).json({
				message: "berhasil menambahkan data Penyuluh",
				newPenyuluh,
				newAccount,
			});
		}
	} catch (error) {
		res.status(error.statusCode || 500).json({
			message: error.message,
		});
	}
};

const uploadDataPenyuluh = async (req, res) => {
	const { peran, id } = req.user || {};
	try {
		if (peran === "petani" || peran === "penyuluh") {
			throw new ApiError(400, "Anda tidak memiliki akses.");
		}

		const { file } = req;
		if (!file) throw new ApiError(400, "File tidak ditemukan.");

		const workbook = new ExcelJS.Workbook();
		await workbook.xlsx.load(file.buffer);

		const worksheet = workbook.getWorksheet(1);
		worksheet.eachRow({ includeEmpty: true }, async (row, rowNumber) => {
			if (rowNumber === 1) return;
			const accountID = crypto.randomUUID();
			const password = row.getCell(6).value.toString();
			const hashedPassword = bcrypt.hashSync(password, 10);
			const urlImg =
				"https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/images/bg-7.png";

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
			});

			await tbl_akun.create({
				email: row.getCell(4).value.toString(),
				password: hashedPassword,
				no_wa: row.getCell(5).value.toString(),
				nama: row.getCell(2).value.toString(),
				pekerjaan: "",
				peran: "penyuluh",
				foto: urlImg,
				accountID: accountID,
			});

			postActivity({
				user_id: id,
				activity: "CREATE",
				type: "DATA PENYULUH",
				detail_id: newPenyuluh.id,
			});
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

const opsiPenyuluh = async (req, res) => {
	const { nama, peran } = req.user || {};
	try {
		if (peran === "petani") {
			throw new ApiError(400, "Anda tidak memiliki akses.");
		} else {
			const dataDaftarPenyuluh = await dataPenyuluh.findAll();
			res.status(200).json({
				message: "Semua Data Penyuluh",
				dataDaftarPenyuluh,
			});
		}
	} catch (error) {
		res.status(error.statusCode || 500).json({
			message: error.message,
		});
	}
};

const daftarPenyuluh = async (req, res) => {
	const { peran } = req.user || {};
	const { page, limit } = req.query;
	try {
		if (peran === "petani" || peran === "penyuluh") {
			throw new ApiError(400, "Anda tidak memiliki akses.");
		}
		const limitFilter = Number(limit) || 10;
		const pageFilter = Number(page) || 1;
		const query = {
			limit: limitFilter,
			offset: (pageFilter - 1) * limitFilter,
			limit: parseInt(limit),
		};
		const data = await dataPenyuluh.findAll({ ...query });
		const total = await dataPenyuluh.count({ ...query });
		res.status(200).json({
			message: "Semua Data Penyuluh",
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

const deleteDaftarPenyuluh = async (req, res) => {
	const { id } = req.params;
	const { nama, peran, id: UserId } = req.user || {};
	try {
		if (
			peran !== "operator potan"
		) {
			throw new ApiError(400, "Anda tidak memiliki akses.");
		} else {
			const data = await dataPenyuluh.findOne({
				where: {
					id: id,
				},
			});
			if (!data) throw new ApiError(400, "data tidak ditemukan.");
			await dataPenyuluh.destroy({
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
				type: "DATA PENYULUH",
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

const presensiKehadiran = async (req, res) => {
	const { nama, peran } = req.user || {};
	try {
		if (
			peran !== "admin" &&
			peran !== "super admin" &&
			peran !== "PENYULUH"
		) {
			throw new ApiError(400, "Anda tidak memiliki akses.");
		} else {
			const DataPresesiKehadiran = await dataPerson.findAll({
				include: [
					{ model: presesiKehadiran, required: true },
					{ model: dataPenyuluh },
				],
			});
			res.status(200).json({
				message: "Semua Data Presensi Kehadiran",
				DataPresesiKehadiran,
			});
		}
	} catch (error) {
		res.status(error.statusCode || 500).json({
			message: error.message,
		});
	}
};

const presensiKehadiranWeb = async (req, res) => {
	const { peran } = req.user || {};
	try {
		if (
			peran !== "admin" &&
			peran !== "super admin" &&
			peran !== "PENYULUH"
		) {
			throw new ApiError(400, "Anda tidak memiliki akses.");
		} else {
			const DataPresesiKehadiran = await presesiKehadiran.findAll({
				include: {
					model: dataPerson,
					required: true,
					include: {
						model: dataPenyuluh,
					},
				},
			});
			res.status(200).json({
				message: "Semua Data Presensi Kehadiran",
				DataPresesiKehadiran,
			});
		}
	} catch (error) {
		res.status(error.statusCode || 500).json({
			message: error.message,
		});
	}
};

const tambahPresensiKehadiran = async (req, res) => {
	const { nama, peran } = req.user || {};
	try {
		if (
			peran !== "admin" &&
			peran !== "super admin" &&
			peran !== "penyuluh"
		) {
			throw new ApiError(400, "Anda tidak memiliki akses.");
		} else {
			const {
				NIP = "",
				tanggalPresensi,
				judulKegiatan,
				deskripsiKegiatan,
			} = req.body;
			const { file } = req;
			const penyuluh = await dataPerson.findOne({ where: { NIP } });

			if (!penyuluh)
				throw new ApiError(
					400,
					`Penyulih dengan NIP ${NIP} Tidak Ditemukan`
				);
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
				const newData = await presesiKehadiran.create({
					id: penyuluh.id,
					tanggalPresesi: tanggalPresensi,
					judulKegiatan,
					deskripsiKegiatan,
					FotoKegiatan: img.url,
				});
				return res.status(200).json({
					message: "Brhasil menambhakan Data Presensi Kehadiran",
					newData,
				});
			}
			const newData = await presesiKehadiran.create({
				id: penyuluh.id,
				tanggalPresesi: tanggalPresensi,
				judulKegiatan,
				deskripsiKegiatan,
			});
			res.status(200).json({
				message: "Brhasil menambhakan Data Presensi Kehadiran",
				newData,
			});
		}
	} catch (error) {
		res.status(error.statusCode || 500).json({
			message: error.message,
		});
	}
};

const jurnalKegiatan = async (req, res) => {
	const { peran } = req.user || {};
	try {
		if (peran === "petani") {
			throw new ApiError(400, "Anda tidak memiliki akses.");
		} else {
			const newData = await jurnalHarian.findAll({
				include: [
					// { model: jurnalHarian, required: true },
					{ model: dataPenyuluh },
				],
			});
			res.status(200).json({
				message: "berhasil mendapatkan data Jurnal",
				newData,
			});
		}
	} catch (error) {
		res.status(error.statusCode || 500).json({
			message: error.message,
		});
	}
};

const jurnalKegiatanbyId = async (req, res) => {
	const { peran } = req.user || {};
	const { id } = req.params;
	// console.log("this is id..", id);
	try {
		if (peran === "petani") {
			throw new ApiError(400, "Anda tidak memiliki akses.");
		} else {
			const newData = await jurnalHarian.findOne({
				where: {
					id: id,
				},
				include: [
					// { model: jurnalHarian, required: true },
					{ model: dataPenyuluh },
				],
			});
			res.status(200).json({
				message: "berhasil mendapatkan data Jurnal",
				newData,
			});
		}
	} catch (error) {
		res.status(error.statusCode || 500).json({
			message: error.message,
		});
	}
};

const deleteJurnalKegiatan = async (req, res) => {
	const { id } = req.params;
	const { nama, peran, id: UserId } = req.user || {};
	try {
		if (peran === "petani") {
			throw new ApiError(400, "Anda tidak memiliki akses.");
		} else {
			const data = await jurnalHarian.findOne({
				where: {
					id: id,
				},
			});
			if (!data) throw new ApiError(400, "data tidak ditemukan.");
			await jurnalHarian.destroy({
				where: {
					id,
				},
			});

			postActivity({
				user_id: UserId,
				activity: "DELETE",
				type: "JURNAL HARIAN",
				detail_id: id,
			});

			res.status(200).json({
				message: "Jurnal Berhasil Di Hapus",
			});
		}
	} catch (error) {
		res.status(error.statusCode || 500).json({
			message: `gagal menghapus data Jurnal, ${error.message}`,
		});
	}
};

const updateJurnalKegiatan = async (req, res) => {
	const { id } = req.params;
	const { nama, peran, id: UserId } = req.user || {};
	try {
		if (peran === "petani") {
			throw new ApiError(400, "Anda tidak memiliki akses.");
		} else {
			const {
				judul,
				tanggalDibuat,
				uraian,
				statusJurnal,
				NIK,
				// gambar,
			} = req.body;
			const { file } = req;
			const data = await jurnalHarian.findOne({
				where: {
					id,
				},
			});
			const penyuluh = await dataPenyuluh.findOne({
				where: { nik: NIK },
			});
			if (!data) throw new ApiError(400, "data tidak ditemukan.");
			let urlImg;
			if (file?.filename) {
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
					fk_penyuluhId: penyuluh.id,
				},
				{
					where: {
						id: id,
					},
				}
			);

			postActivity({
				user_id: UserId,
				activity: "EDIT",
				type: "JURNAL HARIAN",
				detail_id: id,
			});

			res.status(200).json({
				message: "berhasil merubah data Jurnal",
				newData,
			});
		}
	} catch (error) {
		res.status(error.statusCode || 500).json({
			message: error.message,
		});
	}
};

const tambahJurnalKegiatan = async (req, res) => {
	const { nama, peran, id } = req.user || {};
	try {
		if (peran === "petani") {
			throw new ApiError(400, "Anda tidak memiliki akses.");
		} else {
			const { NIK, judul, tanggalDibuat, uraian, statusJurnal } =
				req.body;
			const { file } = req;
			let urlImg;
			if (!NIK) throw new ApiError(400, "NIP tidak boleh kosong");
			const penyuluh = await dataPenyuluh.findOne({
				where: { nik: NIK },
			});
			if (!penyuluh) throw new ApiError(400, "NIP tidak Ditemukan");
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
			const dataJurnalHarian = await jurnalHarian.create({
				judul,
				tanggalDibuat,
				uraian,
				statusJurnal,
				gambar: urlImg,
				pengubah: nama,
				fk_penyuluhId: penyuluh.id,
			});

			postActivity({
				user_id: id,
				activity: "CREATE",
				type: "JURNAL HARIAN",
				detail_id: dataJurnalHarian.id,
			});

			res.status(200).json({
				message: "berhasil menambahkan data Jurnal",
				dataJurnalHarian,
			});
		}
	} catch (error) {
		res.status(error.statusCode || 500).json({
			message: error.message,
		});
	}
};

const RiwayatChat = async (req, res) => {
	const { peran } = req.user || {};
	try {
		if (
			peran !== "admin" &&
			peran !== "super admin" &&
			peran !== "penyuluh"
		) {
			throw new ApiError(400, "Anda tidak memiliki akses.");
		} else {
			const dataRiwayatChat = await dataPerson.findAll({
				include: [
					{ model: riwayatChat, required: true },
					{ model: dataPenyuluh },
				],
			});
			res.status(200).json({
				message: "Semua Data Riwayat Chat",
				dataRiwayatChat,
			});
		}
	} catch (error) {
		res.status(error.statusCode || 500).json({
			message: error.message,
		});
	}
};
const daftarPenyuluhById = async (req, res) => {
	const { id } = req.params;
	const { nama, peran } = req.user || {};
	try {
		if (peran === "petani" || peran === "penyuluh") {
			throw new ApiError(400, "Anda tidak memiliki akses.");
		} else {
			const dataDaftarPenyuluh = await dataPenyuluh.findOne({
				where: { id: id },
			});
			res.status(200).json({
				message: "Semua Data penyuluh",
				dataDaftarPenyuluh,
			});
		}
	} catch (error) {
		res.status(error.statusCode || 500).json({
			message: error.message,
		});
	}
};
const updatePenyuluh = async (req, res) => {
	const { id } = req.params;
	const { nama, peran, id: UserId } = req.user || {};
	try {
		if (peran === "petani" || peran === "penyuluh") {
			throw new ApiError(400, "Anda tidak memiliki akses.");
		} else {
			const {
				nik,
				email,
				NoWa,
				alamat,
				desa,
				nama,
				kecamatan,
				password,
				namaProduct,
				kecamatanBinaan,
				desaBinaan,
			} = req.body;
			const { file } = req;
			console.log(file)
			const data = await dataPenyuluh.findOne({
				where: {
					id,
				},
			});
			if (!data) throw new ApiError(400, "data tidak ditemukan.");
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
			const hashedPassword = bcrypt.hashSync(password, 10);
			// decrypt password
			const accountUpdate = await tbl_akun.update(
				{
					email,
					password: hashedPassword,
					no_wa: NoWa,
					nama,
					pekerjaan: "",
					peran: "penyuluh",
					foto: urlImg,
				},
				{
					where: { accountID: data.accountID },
				}
			);
			const newDataPenyuluh = await dataPenyuluh.update(
				{
					nik,
					email,
					noTelp: NoWa,
					alamat,
					desa,
					nama,
					foto: urlImg,
					kecamatan,
					password: hashedPassword,
					namaProduct,
					kecamatanBinaan,
					desaBinaan,
				},
				{
					where: {
						id: id,
					},
				}
			);

			postActivity({
				user_id: UserId,
				activity: "EDIT",
				type: "DATA PENYULUH",
				detail_id: id,
			});

			res.status(200).json({
				message: "berhasil merubah data Penyuluh",
				newDataPenyuluh,
				accountUpdate,
			});
		}
	} catch (error) {
		res.status(error.statusCode || 500).json({
			message: error.message,
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
};
