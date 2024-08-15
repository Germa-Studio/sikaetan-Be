const {kelompok } = require("../models");

const ApiError = require("../../utils/ApiError");
const dotenv = require("dotenv");
const { Op } = require("sequelize");
const ExcelJS = require("exceljs");
const { postActivity } = require("./logActivity");

dotenv.config();

const getAllKelompok = async (req,res) => {
    const { peran } = req.user || {};
	const { page, limit } = req.query;
	try {
		if (peran !== "operator super admin" && peran !== "operator admin") {
			throw new ApiError(400, "Anda tidak memiliki akses.");
		} else {
			const limitFilter = Number(limit) || 10;
			const pageFilter = Number(page) || 1;

			const query = {
				limit: limitFilter,
				offset: (pageFilter - 1) * limitFilter,
				limit: parseInt(limit),
			};
			const data = await kelompok.findAll({ ...query });
			const total = await kelompok.count({ ...query });
			res.status(200).json({
				message: "Data Kelompok Berhasil Diperoleh",
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
		}
    } catch (error) {
        res.status(error.statusCode || 500).json({
            message: error.message,
        });
    }
}

const uploadDataKelompoks = async (req, res) => {
	const { peran } = req.user || {};

	try {
		if (peran === "petani") {
			throw new ApiError(400, "Anda tidak memiliki akses.");
		}

		const { file } = req;
		if (!file) throw new ApiError(400, "File tidak ditemukan.");

		const workbook = new ExcelJS.Workbook();
		await workbook.xlsx.load(file.buffer);

		const worksheet = workbook.getWorksheet(1);

		// Iterate through rows and columns to read data
		worksheet.eachRow({ includeEmpty: true }, async (row, rowNumber) => {
			if (rowNumber === 1) return;

			await kelompok.create({
				gapoktan: row.getCell(2).value,
				namaKelompok: row.getCell(3).value,
				desa: row.getCell(4).value,
				kecamatan: row.getCell(5).value,
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
	uploadDataKelompoks,
    getAllKelompok
};
