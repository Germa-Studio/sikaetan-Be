const { where } = require("sequelize");
const ApiError = require("../../utils/ApiError");
// const { logactivity, tbl_akun } = require("../models");
const {
	logactivity,
	eventTani: EventTani,
	beritaTani,
	dataPetani,
	tbl_akun,
	dataPenyuluh,
	dataOperator,
} = require("../models");

const activities = [
	{
		txt: "INFO TANI",
		value: beritaTani,
		isAccount: false,
	},
	{
		txt: "EVENT TANI",
		value: EventTani,
		isAccount: false,
	},
	{
		txt: "DATA PETANI",
		value: dataPetani,
		isAccount: true,
	},
	{
		txt: "DATA PENYULUH",
		value: dataPenyuluh,
		isAccount: true,
	},
	{
		txt: "DATA OPERATOR",
		value: dataOperator,
		isAccount: true,
	},
];

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

const getTrashActivity = async (req, res) => {
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
		// console.log("hehe sukses", req);
		const { user_id, activity, type, detail_id } = req;
		const detail = detail_id ? `${type} ${detail_id}` : type;
		const newActivity = await logactivity.create({
			user_id,
			activity,
			detail,
		});
		// res.status(200).json({
		// 	message: "Berhasil Menambahkan Activity",
		// 	newActivity,
		// });
	} catch (error) {
		// res.status(error.statusCode || 500).json({
		// 	message: error.message,
		// });
	}
};

const deleteActivity = async (req, res) => {
	try {
		const { id } = req.params;
		const activity = await logactivity.findByPk(id);
		if (!activity) {
			throw new ApiError(500, "Activity Not Found");
		}
		const detailActivityArr = activity.detail.split(" ");
		const detailActivity = detailActivityArr
			.slice(0, detailActivityArr.length - 1)
			.join(" ");
		activities.forEach((act) => {
			if (act.txt === detailActivity) {
				act.value
					.findOne({
						where: {
							id: detailActivityArr[detailActivityArr.length - 1],
						},
						paranoid: false,
					})
					.then(async (data) => {
						if (data) {
							try {
								data.destroy(
									{
										where: {
											id: detailActivityArr[
												detailActivityArr.length - 1
											],
										},
									},
									{ force: true }
								);
								await activity.destroy();
								res.status(200).json({
									message: "Berhasil Menghapus Permanen",
								});
							} catch (error) {
								res.status(error.statusCode || 500).json({
									message: error.message,
								});
							}
						} else {
							throw new ApiError(500, "Activity Not Found");
						}
					});
			}
		});
	} catch (error) {
		res.status(error.statusCode || 500).json({
			message: error.message,
		});
	}
};

const restoreActivity = async (req, res) => {
	try {
		const { id } = req.params;
		const activity = await logactivity.findByPk(id);
		if (!activity) {
			throw new ApiError(500, "Activity Not Found");
		}
		const detailActivityArr = activity.detail.split(" ");
		const detailActivity = detailActivityArr
			.slice(0, detailActivityArr.length - 1)
			.join(" ");
		activities.forEach(async (act) => {
			if (act.txt === detailActivity) {
				await act.value
					.findOne({
						where: {
							id: detailActivityArr[detailActivityArr.length - 1],
						},
						paranoid: false,
					})
					.then(async (data) => {
						if (data) {
							try {
								data.restore({
									where: {
										id: detailActivityArr[
											detailActivityArr.length - 1
										],
									},
								});
								await activity.destroy();
								res.status(200).json({
									message: "Berhasil Mengembalikan Data",
								});
							} catch (error) {
								res.status(error.statusCode || 500).json({
									message: error.message,
								});
							}
						} else {
							throw new ApiError(500, "Activity Not Found");
						}
					});
			}
		});
	} catch (error) {
		res.status(error.statusCode || 500).json({
			message: error.message,
		});
	}
};

module.exports = {
	getActivity,
	getTrashActivity,
	postActivity,
	deleteActivity,
	restoreActivity,
};
