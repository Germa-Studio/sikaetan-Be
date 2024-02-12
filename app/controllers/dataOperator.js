const {
	dataOperator,
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
dotenv.config();
// import Sequelize from "sequelize";
// import HasOne
const { Sequelize, Op, literal, QueryTypes } = require("sequelize");
const { sequelize } = require("../models"); // Assuming you have your Sequelize instance initialized and exported
const { postActivity } = require("./logActivity");
// const { sequelize } = require('../models'); // Assuming you have your Sequelize instance initialized and exported

const tambahDataOperator = async (req, res) => {
	const { peran, id } = req.user || {};
	try {
		if (peran !== "operator super admin" && peran !== "operator admin") {
			throw new ApiError(400, "Anda tidak memiliki akses.");
		} else {
			const { nik, nkk, nama, peran, email, notelp, alamat, password } =
				req.body;
			const { file } = req;
			const hashedPassword = bcrypt.hashSync(password, 10);
			const accountID = crypto.randomUUID();

			/**
			 * @description saving image
			 */
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
				no_wa: notelp,
				nama,
				pekerjaan: "",
				peran,
				foto: urlImg,
				accountID: accountID,
			});
			const data = await dataOperator.create({
				nik,
				nkk,
				nama,
				email,
				noTelp: notelp,
				foto: urlImg,
				alamat,
				accountID,
				password: hashedPassword,
			});

			postActivity({
				user_id: id,
				activity: "CREATE",
				type: "DATA OPERATOR",
				detail_id: data.id,
			});

			return res.status(200).json({
				status: "success",
				message: "Data operator berhasil ditambahkan",
				data,
				newAccount,
			});
		}
	} catch (error) {
		res.status(error.statusCode || 500).json({
			message: error.message,
		});
	}
};

const getDaftarOperator = async (req, res) => {
	const { peran } = req.user || {};
	const { page, limit } = req.query;
	try {
		if (peran !== "super admin") {
			throw new ApiError(400, "Anda tidak memiliki akses.");
		} else {
			const limitFilter = Number(limit) || 10;
			const pageFilter = Number(page) || 1;

			const query = {
				limit: limitFilter,
				offset: (pageFilter - 1) * limitFilter,
				limit: parseInt(limit),
			};
			const data = await dataOperator.findAll({ ...query });
			const total = await dataOperator.count({ ...query });
			res.status(200).json({
				message: "Data Operator Berhasil Diperoleh",
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
};

const deleteDaftarOperator = async (req, res) => {
	const { id } = req.params;
	const { peran } = req.user || {};
	try {
		if (peran !== "super admin") {
			throw new ApiError(400, "Anda tidak memiliki akses.");
		} else {
			const data = await dataOperator.findOne({
				where: {
					id,
				},
			});
			if (!data) {
				throw new ApiError(404, "Data operator tidak ditemukan");
			} else {
				await dataOperator.destroy({
					where: {
						id,
					},
				});
				await tbl_akun.destroy({
					where: {
						accountID: data.accountID,
					},
				});
			}
			res.status(200).json({
				message: "Data operator berhasil dihapus",
				data,
			});
		}
	} catch (error) {
		res.status(error.statusCode || 500).json({
			message: `gagal menghapus data operator, ${error.message}`,
		});
	}
};

const getOperatorDetail = async (req, res) => {
	const { id } = req.params;
	const { peran } = req.user || {};
	try {
		if (peran !== "super admin") {
			throw new ApiError(400, "Anda tidak memiliki akses.");
		} else {
			const data = await sequelize.query(
				`SELECT do.*, ta.peran
                 FROM dataOperators do
                 LEFT JOIN tbl_akun ta ON do.accountID = ta.accountID
                 WHERE do.id = :id
                 LIMIT 1`,
				{
					replacements: { id },
					type: QueryTypes.SELECT,
				}
			);

			// const data =await dataOperator.findOne({
			//     where: {
			//         id,
			//     },
			// });
			if (!data) {
				throw new ApiError(404, "Data operator tidak ditemukan");
			} else {
				res.status(200).json({
					message: "Data operator berhasil diperoleh",
					data,
				});
			}
		}
	} catch (error) {
		res.status(error.statusCode || 500).json({
			message: error.message,
		});
	}
};

const updateOperatorDetail = async (req, res) => {
	const { id } = req.params;
	const { peran, id: UserId } = req.user || {};

	try {
		if (peran !== "super admin") {
			throw new ApiError(400, "Anda tidak memiliki akses.");
		} else {
			const { nik, nkk, nama, peran, email, notelp, alamat, password } =
				req.body;
			const { file } = req;
			const data = await dataOperator.findOne({
				where: {
					id,
				},
			});
			if (!data) {
				throw new ApiError(404, "Data operator tidak ditemukan");
			} else {
				/**
				 * @description saving image
				 */
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
				const hashedPassword = bcrypt.hashSync(password, 10);
				const updateData = await dataOperator.update(
					{
						nik,
						nkk,
						nama,
						email,
						noTelp: notelp,
						foto: urlImg,
						alamat,
						password: hashedPassword,
					},
					{
						where: {
							id,
						},
					}
				);
				const accountUpdate = await tbl_akun.update(
					{
						email,
						password: hashedPassword,
						no_wa: notelp,
						nama,
						pekerjaan: "",
						peran: peran,
						foto: urlImg,
					},
					{
						where: { accountID: data.accountID },
					}
				);
				res.status(200).json({
					message: "Data operator berhasil diupdate",
					data: updateData,
					accountUpdate,
				});
			}
		}
	} catch (error) {
		res.status(error.statusCode || 500).json({
			message: error.message,
		});
	}
};

const uploadDataOperator = async (req, res) => {};

module.exports = {
	tambahDataOperator,
	getDaftarOperator,
	deleteDaftarOperator,
	getOperatorDetail,
	updateOperatorDetail,
	uploadDataOperator,
};
