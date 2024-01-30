const { where } = require("sequelize");
const { logactivity, tbl_akun } = require("../models");

const getActivity = async (req, res) => {
	const { page, limit } = req.query;
	try {
		const query = {
			include: [
				{
					model: tbl_akun,
				},
			],
			limit: Number(limit),
			offset: (Number(page) - 1) * Number(limit),
		};
		const activity = await logactivity.findAll(
			page && limit ? query : { include: [{ model: tbl_akun }] }
		);
		const total = await logactivity.count(
			page && limit ? query : { include: [{ model: tbl_akun }] }
		);
		res.status(200).json({
			message: "Berhasil Mendapatkan Activity",
			data: activity,
			total,
			currentPages: Number(page),
			limit: Number(limit),
			maxPages: Math.ceil(total / Number(limit)),
			from: Number(page) ? (Number(page) - 1) * Number(limit) + 1 : 1,
			to: Number(page)
				? (Number(page) - 1) * Number(limit) + activity.length
				: activity.length,
		});
	} catch (error) {
		res.status(error.statusCode || 500).json({
			message: error.message,
		});
	}
};

const getDataSampah = async (req, res) => {
	try {
		const { page, limit } = req.query;
		const query = {
			include: [
				{
					model: tbl_akun,
				},
			],
			where: {
				activity: "DELETE",
			},
			limit: Number(limit),
			offset: (Number(page) - 1) * Number(limit),
		};
		const activity = await logactivity.findAll(
			page && limit ? query : { include: [{ model: tbl_akun }] }
		);
		const total = await logactivity.count(
			page && limit ? query : { include: [{ model: tbl_akun }] }
		);
		res.status(200).json({
			message: "Berhasil Mendapatkan Data Sampah",
			data: activity,
			total,
			currentPages: Number(page),
			limit: Number(limit),
			maxPages: Math.ceil(total / Number(limit)),
			from: Number(page) ? (Number(page) - 1) * Number(limit) + 1 : 1,
			to: Number(page)
				? (Number(page) - 1) * Number(limit) + activity.length
				: activity.length,
		});
	} catch (error) {
		res.status(error.statusCode || 500).json({
			message: error.message,
		});
	}
};

const postActivity = async (req, res) => {
	try {
		const { user_id, activity, type, detail_id } = req.body;
		const detail = detail_id ? `${type} ${detail_id}` : type;
		const newActivity = await logactivity.create({
			user_id,
			activity,
			detail,
		});
		res.status(200).json({
			message: "Berhasil Menambahkan Activity",
			newActivity,
		});
	} catch (error) {
		res.status(error.statusCode || 500).json({
			message: error.message,
		});
	}
};

module.exports = {
	getActivity,
	postActivity,
};
