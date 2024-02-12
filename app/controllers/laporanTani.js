const { laporanTanam, tanamanPetani } = require("../models");
const { Op } = require("sequelize");
const ApiError = require("../../utils/ApiError");
const imageKit = require("../../midleware/imageKit");
const { postActivity } = require("./logActivity");

const tambahLaporanTanam = async (req, res) => {
	try {
		const { tanamanPetaniId, tanggalLaporan, komdisiTanaman, deskripsi } =
			req.body;
		const { id } = req.user;
		if (!tanamanPetaniId)
			throw new ApiError(400, "Id Tanaman Petani Tidak Boleh Kosong");
		if (!tanggalLaporan)
			throw new ApiError(400, "Tanggal Laporan Tidak Boleh Kosong");
		if (!komdisiTanaman)
			throw new ApiError(400, "Kondisi Tanaman Tidak Boleh Kosong");
		if (!deskripsi)
			throw new ApiError(400, "Deskripsi Tanaman Tidak Boleh Kosong");
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
			const newLaporanTanam = await laporanTanam.create({
				tanamanPetaniId,
				tanggalLaporan,
				komdisiTanaman,
				deskripsi,
				fotoTanaman: img.url,
			});

			postActivity({
				user_id: id,
				activity: "CREATE",
				type: "LAPORAN TANAM",
				detail_id: newLaporanTanam.id,
			});

			return res.status(200).json({
				message: "Berhasil Menambahakan laporan tanam",
				newLaporanTanam,
			});
		}
		const newLaporanTanam = await laporanTanam.create({
			tanamanPetaniId,
			tanggalLaporan,
			komdisiTanaman,
			deskripsi,
		});

		postActivity({
			user_id: id,
			activity: "CREATE",
			type: "LAPORAN TANAM",
			detail_id: newLaporanTanam.id,
		});

		res.status(200).json({
			message: "Berhasil Menambahakan laporan tanam",
			newLaporanTanam,
		});
	} catch (error) {
		res.status(error.statusCode || 500).json({
			message: error.message,
		});
	}
};
const getAllLaporanTanam = async (req, res) => {
	const { id } = req.params;
	try {
		const daftarTani = await tanamanPetani.findOne({
			include: {
				model: laporanTanam,
			},
			where: { id },
		});
		res.status(200).json({
			message: "Berhasil Mendapatkan laporan tanam",
			daftarTani,
		});
	} catch (error) {
		res.status(error.statusCode || 500).json({
			message: error.message,
		});
	}
};
const getLaporanTanamById = async (req, res) => {
	const { id } = req.params;
	try {
		const daftarTani = await laporanTanam.findOne({ where: { id } });
		res.status(200).json({
			message: "Berhasil Mendapatkan laporan tanam",
			daftarTani,
		});
	} catch (error) {
		res.status(error.statusCode || 500).json({
			message: error.message,
		});
	}
};
const editLaporanTanam = async (req, res) => {
	try {
		const { id: UserId } = req.user;
		const { tanggalLaporan, komdisiTanaman, deskripsi } = req.body;
		if (!tanggalLaporan)
			throw new ApiError(400, "Tanggal Laporan Tidak Boleh Kosong");
		if (!komdisiTanaman)
			throw new ApiError(400, "Kondisi Tanaman Tidak Boleh Kosong");
		if (!deskripsi)
			throw new ApiError(400, "Deskripsi Tanaman Tidak Boleh Kosong");
		const { id } = req.params;
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
			await laporanTanam.update(
				{
					tanggalLaporan,
					komdisiTanaman,
					deskripsi,
					fotoTanaman: img.url,
				},
				{ where: { id } }
			);

			postActivity({
				user_id: UserId,
				activity: "EDIT",
				type: "LAPORAN TANAM",
				detail_id: id,
			});

			const newLaporanTanam = laporanTanam.findOne({ where: { id } });
			return res.status(200).json({
				message: "Berhasil Merubah laporan tanam",
				newLaporanTanam,
			});
		}
		await laporanTanam.update(
			{ tanggalLaporan, komdisiTanaman, deskripsi },
			{ where: { id } }
		);

		postActivity({
			user_id: UserId,
			activity: "EDIT",
			type: "LAPORAN TANAM",
			detail_id: id,
		});

		const newLaporanTanam = laporanTanam.findOne({ where: { id } });
		res.status(200).json({
			message: "Berhasil Merubah laporan tanam",
			newLaporanTanam,
		});
	} catch (error) {
		res.status(error.statusCode || 500).json({
			message: error.message,
		});
	}
};
const deleteLaporanTanam = async (req, res) => {
	const { id } = req.params;
	const { id: UserId } = req.user;
	try {
		await laporanTanam.destroy({ where: { id } });

		postActivity({
			user_id: UserId,
			activity: "DELETE",
			type: "LAPORAN TANAM",
			detail_id: id,
		});

		res.status(200).json({
			message: "Berhasil menghapus laporan tanam",
		});
	} catch (error) {
		res.status(error.statusCode || 500).json({
			message: error.message,
		});
	}
};
const tambahLaporanAkhir = async (req, res) => {
	try {
		const { id: UserId } = req.user;
		const {
			tanamanPetaniId,
			tanggalLaporan,
			komdisiTanaman,
			deskripsi,
			realisasiHasilPanen,
			realisasiLuasLahan,
		} = req.body;
		if (!tanamanPetaniId)
			throw new ApiError(400, "Id Tanaman Petani Tidak Boleh Kosong");
		if (!tanggalLaporan)
			throw new ApiError(400, "Tanggal Laporan Tidak Boleh Kosong");
		if (!komdisiTanaman)
			throw new ApiError(400, "Kondisi Tanaman Tidak Boleh Kosong");
		if (!deskripsi)
			throw new ApiError(400, "Deskripsi Tanaman Tidak Boleh Kosong");
		if (!realisasiHasilPanen)
			throw new ApiError(400, "Realisasi Hasil Panen Tidak Boleh Kosong");
		if (!realisasiLuasLahan)
			throw new ApiError(400, "Realisasi Luas Lahan Tidak Boleh Kosong");
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
			const newLaporanTanam = await laporanTanam.create({
				tanamanPetaniId,
				tanggalLaporan,
				komdisiTanaman,
				deskripsi,
				fotoTanaman: img.url,
			});
			await tanamanPetani.update(
				{ realisasiHasilPanen, realisasiLuasLahan },
				{ where: { id: tanamanPetaniId } }
			);

			postActivity({
				user_id: UserId,
				activity: "CREATE",
				type: "LAPORAN AKHIR",
				detail_id: newLaporanTanam.id,
			});

			return res.status(200).json({
				message: "Berhasil Menambahakan laporan akhir tanam",
				newLaporanTanam,
			});
		}
		const newLaporanTanam = await laporanTanam.create({
			tanamanPetaniId,
			tanggalLaporan,
			komdisiTanaman,
			deskripsi,
		});
		await tanamanPetani.update(
			{ realisasiHasilPanen, realisasiLuasLahan },
			{ where: { id: tanamanPetaniId } }
		);

		postActivity({
			user_id: UserId,
			activity: "CREATE",
			type: "LAPORAN AKHIR",
			detail_id: newLaporanTanam.id,
		});

		res.status(200).json({
			message: "Berhasil Menambahakan laporan akhir tanam",
			newLaporanTanam,
		});
	} catch (error) {
		res.status(error.statusCode || 500).json({
			message: error.message,
		});
	}
};

module.exports = {
	tambahLaporanTanam,
	getAllLaporanTanam,
	getLaporanTanamById,
	editLaporanTanam,
	deleteLaporanTanam,
	tambahLaporanAkhir,
};
