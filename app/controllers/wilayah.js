const {
	kecamatan,
    desa
} = require("../models");
const ExcelJS = require("exceljs");

const addWilayah = async (req, res) => {
    try {
        const { file } = req;
		if (!file) throw new ApiError(400, "File tidak ditemukan.");

		const workbook = new ExcelJS.Workbook();
		await workbook.xlsx.load(file.buffer);
		const worksheet = workbook.getWorksheet(1);

        const rowCount = worksheet.rowCount;
        if (rowCount < 2) throw new ApiError(400, "Data tidak ditemukan.");

        for (let index = 2; index < rowCount; index++) {
            const row = worksheet.getRow(index);
            const kecamatanData = row.getCell(1).value;
            const desaData = row.getCell(2).value;
            const tipeData = row.getCell(3).value;

            const kecamatanResult = await kecamatan.findOrCreate({
                where: {
                    nama: kecamatanData
                }
            });

            console.log(JSON.stringify(kecamatanResult));

            const kecamatanId = kecamatanResult[0].id;
            await desa.create({
                nama: desaData,
                kecamatanId,
                type: tipeData ?? undefined
            });
        }

        res.status(200).json({
            status: "success",
            message: "Data wilayah berhasil ditambahkan."
        });
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: error.message,
        });
    }
}

const getKecamatan = async (req, res) => {
    try {
        const data = await kecamatan.findAll();
        res.status(200).json({
            status: "success",
            data,
        });
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: error.message,
        });
    }
}

const getDesaByKecamatan = async (req, res) => {
    try {
        const { kecamatanId } = req.query;
        const data = await desa.findAll({
            where: {
                kecamatanId
            }
        });
        res.status(200).json({
            status: "success",
            data,
        });
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: error.message,
        });
    }
}

module.exports = {
    getKecamatan,
    getDesaByKecamatan,
    addWilayah
}