const { tanamanPetani, kelompok, dataPetani } = require("../models");
const ApiError = require("../../utils/ApiError");
const imageKit = require("../../midleware/imageKit");
const dotenv = require("dotenv");
const bcrypt = require("bcrypt");
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
    }

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
    getAllTanamanPetani
}
