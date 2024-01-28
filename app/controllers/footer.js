const { Footer } = require("../models");

const getFooters = async (req, res) => {
  try {
    const { key } = req.query;
    const filter = key ? { key } : {};
    const data = await Footer.findAll({
      where: filter,
    });

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
    const { key = "", value = "" } = req.body;

    const filter = key ? { key } : {};
    const data = await Footer.findAll({
      where: filter,
    });
    if (data.length === 0) {
      await Footer.create({
        key: key,
        value,
        isActive: true,
      });
    } else {
      await Footer.update(
        {
          value,
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
