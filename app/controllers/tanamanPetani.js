const { tanamanPetani, kelompok, dataPetani } = require("../models");
const ApiError = require("../../utils/ApiError");
const imageKit = require("../../midleware/imageKit");
const dotenv = require("dotenv");
const bcrypt = require("bcrypt");
const { Op, Sequelize } = require("sequelize");

dotenv.config();

const getAllTanamanPetani = async (req, res) => {
  const { peran } = req.user || {};

  try {
    if (peran !== "admin" && peran !== "super admin" && peran !== "penyuluh") {
      throw new ApiError(403, "Anda tidak memiliki akses.");
    }

    const data = await tanamanPetani.findAll({
      include: [
        {
          model: dataPetani,
          as: "dataPetani",
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

const getTanamanPetaniStatistically = async (req, res) => {
  const { month, year, lineType, pieType } = req.query;
  try {
    const lineChartType = lineType || "komoditas";
    const pieChartType = pieType || "komoditas";
    const lineChart = await tanamanPetani.findAll({
      attributes: [
        [Sequelize.fn("DATE", Sequelize.col("createdAt")), "date"],
        lineChartType,
        [Sequelize.fn("COUNT", Sequelize.col(lineChartType)), "count"],
      ],
      group: [lineChartType, Sequelize.fn("DATE", Sequelize.col("createdAt"))],
      where: {
        createdAt: {
          [Op.between]: [
            new Date(`${year}-${month}-01`),
            new Date(`${year}-${month}-31`),
          ],
        },
      },
      order: [[Sequelize.col("createdAt"), "ASC"]],
    });
    const pieChart = await tanamanPetani.findAll({
      attributes: [
        pieChartType,
        [Sequelize.fn("COUNT", Sequelize.col(pieChartType)), "count"],
      ],
      group: [pieChartType],
      where: {
        createdAt: {
          [Op.between]: [
            new Date(`${year}-${month}-01`),
            new Date(`${year}-${month}-31`),
          ],
        },
      },
    });
    const latest = await tanamanPetani.findAll({
      order: [[Sequelize.col("createdAt"), "DESC"]],
      limit: 5,
    });
    res.status(200).json({
      message: "Data berhasil didapatkan.",
      data: {
        statistik: lineChart,
        summary: pieChart,
        latest,
      },
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: error.message,
    });
  }
};

const getDetailedDataTanamanPetani = async (req, res) => {
  const { id } = req.params;
  const { peran } = req.user || {};

  try {
    if (peran !== "admin" && peran !== "super admin" && peran !== "penyuluh") {
      throw new ApiError(403, "Anda tidak memiliki akses.");
    }

    const data = await tanamanPetani.findOne({
      where: { id },
      include: [
        {
          model: dataPetani,
          as: "dataPetani",
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

module.exports = {
  getAllTanamanPetani,
  getTanamanPetaniStatistically,
};
