const {
  dataPenyuluh,
  penjual,
  tbl_akun: tblAkun,
  dataPetani,
} = require("../models");
const ApiError = require("../../utils/ApiError");
const imageKit = require("../../midleware/imageKit");

const tambahDaftarPenjual = async (req, res) => {
  try {
    const {
      nik,
      profesiPenjual,
      namaProducts,
      stok,
      satuan,
      harga,
      deskripsi,
      status,
    } = req.body;

    const { id: penjualId } = req.params;

    let id;
    if (!nik) throw new ApiError(400, "NIK tidak boleh kosong");

    if (profesiPenjual == "penyuluh") {
      const person = await dataPenyuluh.findOne({
        where: { nik },
      });
      if (!person)
        throw new ApiError(400, `data dengan NIK ${nik} tidak terdaftar`);
      id = person.accountID;
    } else {
      const person = await dataPetani.findOne({
        where: { nik },
      });
      if (!person)
        throw new ApiError(400, `data dengan NIK ${nik} tidak terdaftar`);
      id = person.accountID;
    }
    const { file } = req;
    let imageUrl = null;
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
      imageUrl = img.url;
    }

    if (penjualId === "add") {
      const newPenjual = await penjual.create({
        profesiPenjual,
        namaProducts,
        stok,
        satuan: satuan === "" ? "Pcs" : satuan,
        harga,
        deskripsi,
        fotoTanaman: imageUrl,
        status,
        accountID: id,
      });

      const dataPenjual = await penjual.findOne({
        where: { id: newPenjual.id },
        include: [
          {
            model: tblAkun,
          },
        ],
      });

      return res.status(200).json({
        message: "Berhasil Membuat Data Penjual",
        dataPenjual,
      });
    } else {
      const dataPenjual = await penjual.findOne({
        where: { id: penjualId },
        include: [
          {
            model: tblAkun,
          },
        ],
      });

      await dataPenjual.update({
        profesiPenjual,
        namaProducts,
        stok,
        satuan: satuan === "" ? "Pcs" : satuan,
        harga,
        deskripsi,
        fotoTanaman: imageUrl,
        status,
        accountID: id,
      });

      return res.status(200).json({
        message: "Berhasil Memperbarui Data Penjual",
        dataPenjual,
      });
    }
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: error.message,
    });
  }
};

const productPetani = async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  try {
    const limitFilter = Number(limit);
    const pageFilter = Number(page);
    const query = {
      include: [
        {
          model: tblAkun,
          attributes: {
            exclude: ["password"],
          },
          include: [
            {
              model: dataPetani,
            },
            {
              model: dataPenyuluh,
            },
          ],
        },
      ],
      limit: limitFilter,
      offset: (pageFilter - 1) * limitFilter,
    };

    const data = await penjual.findAll(query);
    const total = await penjual.count(query);
    res.status(200).json({
      message: "Berhasil Mendapatkan Product Petani",
      data,
      total,
      currentPages: Number(page),
      limit: Number(limit),
      maxPages: Math.ceil(total / Number(limit)),
      from: Number(page) ? (Number(page) - 1) * Number(limit) + 1 : 1,
      to: Number(page)
        ? (Number(page) - 1) * Number(limit) + data.length
        : data.length,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: error.message,
    });
  }
};

const getDetailProduk = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await penjual.findOne({
      where: {
        id,
      },
      include: [
        {
          model: tblAkun,
          include: [
            {
              model: dataPetani,
            },
            {
              model: dataPenyuluh,
            },
          ],
        },
      ],
    });

    if (!data) throw new ApiError(404, "Data Tidak Ditemukan");
    res.status(200).json({
      message: "Berhasil Mendapatkan Detail Produk",
      data,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: error.message,
    });
  }
};

const deleteProduk = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await penjual.destroy({
      where: {
        id,
      },
    });
    res.status(200).json({
      message: "Berhasil Menghapus Data Penjual",
      data,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: error.message,
    });
  }
};

const productPenyuluh = async (req, res) => {
  try {
    const data = await penjual.findAll({
      include: [
        {
          model: tblAkun,
          required: true,
        },
      ],
      where: {
        profesiPenjual: "Penyuluh",
      },
    });
    res.status(200).json({
      message: "Berhasil Mendapatkan Product Penyuluh",
      productPenyuluh: data,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: error.message,
    });
  }
};

module.exports = {
  tambahDaftarPenjual,
  productPetani,
  productPenyuluh,
  deleteProduk,
  getDetailProduk,
};
