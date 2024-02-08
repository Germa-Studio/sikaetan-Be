const { Footer } = require("../models");
const imageKit = require("../../midleware/imageKit");

const getFooters = async (req, res) => {
  try {
    const { key } = req.query;
    const filter = key ? { key } : {};
    const data = await Footer.findAll({
      where: filter,
    });
    const { peran } = req.user || {};
    if (peran !== "operator admin" && peran !== "operator super admin") {
      throw new ApiError(400, "Anda tidak memiliki akses.");
    }
    if (data.length === 0) {
      res.status(404).json({
        message: "Footer Tidak Ditemukan",
      });
    } else {
      if (key) {
        res.status(200).json({
          message: "Footer Berhasil Dimuat",
          footer: data[0],
        });
      } else
        res.status(200).json({
          message: "Footer Berhasil Dimuat",
          footer: data,
        });
    }
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: error.message,
    });
  }
};

const updateFooter = async (req, res) => {
  try {
    const { key, value } = req.body;
    const { file } = req;
    const { peran } = req.user || {};
    if (peran !== "operator admin" && peran !== "operator super admin") {
      throw new ApiError(400, "Anda tidak memiliki akses.");
    }
    if (!key) {
      res.status(400).json({
        message: "Key tidak boleh kosong",
      });
      return;
    }

    if (!value && !file) {
      res.status(400).json({
        message: "Value atau file tidak boleh kosong",
      });
      return;
    }

    let img = null;

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
      img = await imageKit.upload({
        file: file.buffer,
        fileName: `IMG-footer-${key}.${ext}`,
      });
    }

    const filter = key ? { key } : {};
    const data = await Footer.findAll({
      where: filter,
    });

    if (data.length === 0) {
      await Footer.create({
        key: key,
        value: img ? img.url : value,
        isActive: true,
      });
    } else {
      await Footer.update(
        {
          value: img ? img.url : value,
        },
        {
          where: {
            key: key,
          },
        }
      );
    }
    res.status(200).json({
      message: "Footer Berhasil Diperbarui",
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: error.message,
    });
  }
};

const deleteFooter = async (req, res) => {
  try {
    const { key, hide } = req.query;

    if (!key) {
      res.status(400).json({
        message: "Key tidak boleh kosong",
      });
      return;
    }
    
    const { peran } = req.user || {};
    if (peran !== "operator admin" && peran !== "operator super admin") {
      throw new ApiError(400, "Anda tidak memiliki akses.");
    }

    const filter = key ? { key: key } : {};
    const data = await Footer.findAll({
      where: filter,
    });

    if (data.length === 0) {
      res.status(404).json({
        message: "Footer Tidak Ditemukan",
      });
    } else {
      if (hide == "true") {
        await Footer.update(
          {
            isActive: false,
          },
          {
            where: {
              key: key,
            },
          }
        );
      } else {
        await Footer.destroy({
          where: filter,
        });
      }
      res.status(200).json({
        message: "Footer Berhasil Dihapus",
      });
    }
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: error.message,
    });
  }
};

module.exports = { getFooters, updateFooter, deleteFooter };
