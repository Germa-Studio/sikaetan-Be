const { dataTanaman, kelompok } = require("../models");

const ApiError = require("../../utils/ApiError");
const dotenv = require("dotenv");
const { Op } = require("sequelize");
const ExcelJS = require("exceljs");
const { postActivity } = require("./logActivity");

dotenv.config();

const getAllDataTanaman = async (req, res) => {
	const { peran } = req.user || {};
	const { limit, page, sortBy, sortType, poktan_id, isExport } = req.query;

	try {
		if (
			peran !== "admin" &&
			peran !== "super admin" &&
			peran !== "penyuluh"
		) {
			throw new ApiError(403, "Anda tidak memiliki akses.");
		}

		const limitFilter = Number(limit);
		const pageFilter = Number(page);
		const isExportFilter = Boolean(isExport);

		const filter = {
			include: [
				{
					model: kelompok,
					as: "kelompok",
				},
			],
			limit: limitFilter,
			offset: (pageFilter - 1) * limitFilter,
			order: [[sortBy || "id", sortType || "ASC"]],
		};

		if (poktan_id !== "undefined") {
			filter.where = {
				fk_kelompokId: {
					[Op.eq]: poktan_id,
				},
			};
		}

		const data = await dataTanaman.findAll(
			isExportFilter
				? {
						include: [
							{
								model: kelompok,
								as: "kelompok",
							},
						],
				  }
				: filter
		);
		const total = await dataTanaman.count(filter);

		res.status(200).json({
			message: "Data berhasil didapatkan.",
			data: {
				data,
				total,
				currentPages: Number(page),
				limit: Number(limit),
				maxPages: Math.ceil(total / Number(limit)),
				from: Number(page) ? (Number(page) - 1) * Number(limit) + 1 : 1,
				to: Number(page)
					? (Number(page) - 1) * Number(limit) + data.length
					: data.length,
				sortBy: sortBy || "id",
				sortType: sortType || "ASC",
			},
		});
	} catch (error) {
		res.status(error.statusCode || 500).json({
			message: error.message,
		});
	}
};

const getDetailedDataTanaman = async (req, res) => {
	const { id } = req.params;
	const { peran } = req.user || {};

	try {
		if (
			peran !== "admin" &&
			peran !== "super admin" &&
			peran !== "penyuluh"
		) {
			throw new ApiError(403, "Anda tidak memiliki akses.");
		}

		const data = await dataTanaman.findOne({
			where: { id },
			include: [
				{
					model: kelompok,
					as: "kelompok",
				},
			],
		});

		res.status(200).json({
			message: "Data berhasil didapatkan.",
			data,
		});
	} catch (error) {
		res.status(error.statusCode || 500).json({
			message: error.message,
		});
	}
};

const tambahDataTanaman = async (req, res) => {
	const { peran, id } = req.user || {};

	try {
		if (
			peran !== "admin" &&
			peran !== "super admin" &&
			peran !== "penyuluh"
		) {
			throw new ApiError(403, "Anda tidak memiliki akses.");
		}
		const {
			kategori,
			komoditas,
			periodeTanam,
			luasLahan,
			prakiraanLuasPanen,
			prakiraanHasilPanen,
			prakiraanBulanPanen,
			fk_kelompokId,
		} = req.body;

		if (!kategori) throw new ApiError(400, "Kategori tidak boleh kosong.");
		if (!komoditas)
			throw new ApiError(400, "Komoditas tidak boleh kosong.");
		if (!periodeTanam)
			throw new ApiError(400, "Periode tanam tidak boleh kosong.");
		if (!luasLahan)
			throw new ApiError(400, "Luas lahan tidak boleh kosong.");
		if (!prakiraanLuasPanen)
			throw new ApiError(400, "Prakiraan luas panen tidak boleh kosong.");
		if (!prakiraanHasilPanen)
			throw new ApiError(
				400,
				"Prakiraan hasil panen tidak boleh kosong."
			);
		if (!prakiraanBulanPanen)
			throw new ApiError(
				400,
				"Prakiraan bulan panen tidak boleh kosong."
			);
		if (!fk_kelompokId)
			throw new ApiError(400, "Kelompok tidak boleh kosong.");

		const kelompokTani = await kelompok.findOne({
			where: { id: fk_kelompokId },
		});
		if (!kelompokTani) throw new ApiError(400, "Kelompok tidak ditemukan.");

		const data = await dataTanaman.create({
			kategori,
			komoditas,
			periodeTanam,
			luasLahan,
			prakiraanLuasPanen,
			prakiraanHasilPanen,
			prakiraanBulanPanen,
			fk_kelompokId,
		});

		postActivity({
			user_id: id,
			activity: "CREATE",
			type: "DATA TANAMAN",
			detail_id: data.id,
		});

		res.status(201).json({
			message: "Data berhasil ditambahkan.",
			data,
		});
	} catch (error) {
		res.status(error.statusCode || 500).json({
			message: error.message,
		});
	}
};

const editDataTanaman = async (req, res) => {
	const { id } = req.params;
	const { peran, id: UserId } = req.user || {};

	try {
		if (
			peran !== "admin" &&
			peran !== "super admin" &&
			peran !== "penyuluh"
		) {
			throw new ApiError(403, "Anda tidak memiliki akses.");
		}
		const {
			kategori,
			komoditas,
			periodeTanam,
			luasLahan,
			prakiraanLuasPanen,
			prakiraanHasilPanen,
			prakiraanBulanPanen,
			fk_kelompokId,
			realisasiLuasPanen,
			realisasiHasilPanen,
			realisasiBulanPanen,
		} = req.body;

		if (!kategori) throw new ApiError(400, "Kategori tidak boleh kosong.");
		if (!komoditas)
			throw new ApiError(400, "Komoditas tidak boleh kosong.");
		if (!periodeTanam)
			throw new ApiError(400, "Periode tanam tidak boleh kosong.");
		if (!luasLahan)
			throw new ApiError(400, "Luas lahan tidak boleh kosong.");
		if (!prakiraanLuasPanen)
			throw new ApiError(400, "Prakiraan luas panen tidak boleh kosong.");
		if (!prakiraanHasilPanen)
			throw new ApiError(
				400,
				"Prakiraan hasil panen tidak boleh kosong."
			);
		if (!prakiraanBulanPanen)
			throw new ApiError(
				400,
				"Prakiraan bulan panen tidak boleh kosong."
			);
		if (!fk_kelompokId)
			throw new ApiError(400, "Kelompok tidak boleh kosong.");

		const kelompokTani = await kelompok.findOne({
			where: { id: fk_kelompokId },
		});
		if (!kelompokTani) throw new ApiError(400, "Kelompok tidak ditemukan.");

		await dataTanaman.update(
			{
				kategori,
				komoditas,
				periodeTanam,
				luasLahan,
				prakiraanLuasPanen,
				prakiraanHasilPanen,
				prakiraanBulanPanen,
				fk_kelompokId,
				realisasiLuasPanen,
				realisasiHasilPanen,
				realisasiBulanPanen,
			},
			{ where: { id } }
		);

		postActivity({
			user_id: UserId,
			activity: "EDIT",
			type: "DATA TANAMAN",
			detail_id: id,
		});

		res.status(201).json({
			message: "Data berhasil diupdate.",
			data: req.body,
		});
	} catch (error) {
		res.status(error.statusCode || 500).json({
			message: error.message,
		});
	}
};

const hapusDataTanaman = async (req, res) => {
	const { id } = req.params;
	const { peran, id: UserId } = req.user || {};

	try {
		if (
			peran !== "admin" &&
			peran !== "super admin" &&
			peran !== "penyuluh"
		) {
			throw new ApiError(403, "Anda tidak memiliki akses.");
		}

		await dataTanaman.destroy({
			where: { id },
		});

		postActivity({
			user_id: UserId,
			activity: "DELETE",
			type: "DATA TANAMAN",
			detail_id: id,
		});

		res.status(200).json({
			message: "Data berhasil dihapus.",
		});
	} catch (error) {
		res.status(error.statusCode || 500).json({
			message: error.message,
		});
	}
};

const uploadDataTanaman = async (req, res) => {
	const { peran } = req.user || {};

	try {
		if (
			peran !== "admin" &&
			peran !== "super admin" &&
			peran !== "penyuluh"
		) {
			throw new ApiError(403, "Anda tidak memiliki akses.");
		}

		const { file } = req;
		if (!file) throw new ApiError(400, "File tidak ditemukan.");

		const workbook = new ExcelJS.Workbook();
		await workbook.xlsx.load(file.buffer);

		const worksheet = workbook.getWorksheet(1);

		// Iterate through rows and columns to read data
		worksheet.eachRow({ includeEmpty: true }, async (row, rowNumber) => {
			if (rowNumber === 1) return;

			await dataTanaman.create({
				fk_kelompokId: row.getCell(1).value,
				kategori: row.getCell(2).value,
				komoditas: row.getCell(3).value,
				periodeTanam: row.getCell(4).value,
				luasLahan: row.getCell(5).value,
				prakiraanLuasPanen: row.getCell(6).value,
				prakiraanHasilPanen: row.getCell(7).value,
				prakiraanBulanPanen: row.getCell(8).value,
				realisasiLuasPanen: row.getCell(9).value,
				realisasiHasilPanen: row.getCell(10).value,
				realisasiBulanPanen: row.getCell(11).value,
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

module.exports = {
	tambahDataTanaman,
	getAllDataTanaman,
	getDetailedDataTanaman,
	editDataTanaman,
	hapusDataTanaman,
	uploadDataTanaman,
};
