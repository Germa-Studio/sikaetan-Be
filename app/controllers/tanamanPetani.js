const { tanamanPetani, kelompok, dataPetani } = require("../models");
const ApiError = require("../../utils/ApiError");
const imageKit = require("../../midleware/imageKit");
const dotenv = require("dotenv");
const bcrypt = require("bcrypt");
dotenv.config();

const getAllTanamanPetani = async (req, res) => {
    const { limit, page, sortBy, sortType, search } = req.query;
    const { peran } = req.user || {};
    
    try {
        if (peran !== "admin" && peran !== "super admin" && peran !== "penyuluh") {
          throw new ApiError(403, "Anda tidak memiliki akses.");
        }
        const limitFilter = Number(limit) || 10;
        const pageFilter = Number(page) || 1;

        const data = await tanamanPetani.findAll({
          include: [
            {
              model: dataPetani,
              as: "dataPetani",
            },
          ],
          limit: limitFilter,
          offset: (pageFilter - 1) * limitFilter,
          order: [[sortBy || "id", sortType || "ASC"]],
        });

        const total = await tanamanPetani.count();
        res.status(200).json({
          message: "Data berhasil didapatkan.",
          data: {
            data,
            total,
            currentPages: Number(page) || 1,
            limit: Number(limit) || 10,
            maxPages: Math.ceil(total / (Number(limit) || 10)),
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

  const getDetailedDataTanamanPetani = async (req, res) => {
      const { id } = req.params;
      const { peran } = req.user || {};
    
      try {
        if (peran !== "admin" && peran !== "super admin" && peran !== "penyuluh") {
          throw new ApiError(403, "Anda tidak memiliki akses.");
        }
        
        const limitFilter = Number(limit) || 10;
        const pageFilter = Number(page) || 1;

        const data = await tanamanPetani.findOne({
          where: { id },
          include: [
            {
              model: dataPetani,
              as: "dataPetani",
            },
          ],
          limit: limitFilter,
          offset: (pageFilter - 1) * limitFilter,
          order: [[sortBy || "id", sortType || "ASC"]],
        });

        const total = await tanamanPetani.count();
    
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
    getAllTanamanPetani
}
