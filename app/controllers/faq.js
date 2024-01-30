const { faq } = require("../models");

const getFaqs = async (req, res) => {
  try {
    const data = await faq.findAll();
    res.status(200).json({
      message: "FAQ Berhasil Dimuat",
      faq: data,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: error.message,
    });
  }
};

const getDetailFaq = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await faq.findOne({
      where: {
        id,
      },
    });
    if (!data) {
      res.status(404).json({
        message: "FAQ Tidak Ditemukan",
      });
    } else {
      res.status(200).json({
        message: "FAQ Berhasil Dimuat",
        faq: data,
      });
    }
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: error.message,
    });
  }
};

const createFaq = async (req, res) => {
  try {
    const { question, answer } = req.body;
    const data = await faq.create({
      question,
      answer,
    });
    res.status(201).json({
      message: "FAQ Berhasil Ditambahkan",
      faq: data,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: error.message,
    });
  }
};

const updateFaq = async (req, res) => {
  try {
    const { id } = req.params;
    const { question, answer } = req.body;
    const data = await faq.findOne({
      where: {
        id,
      },
    });
    if (!data) {
      res.status(404).json({
        message: "FAQ Tidak Ditemukan",
      });
    } else {
      await faq.update(
        {
          question,
          answer,
        },
        {
          where: {
            id,
          },
        }
      );
      res.status(200).json({
        message: "FAQ Berhasil Diperbarui",
      });
    }
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: error.message,
    });
  }
};

const deleteFaq = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await faq.findOne({
      where: {
        id,
      },
    });
    if (!data) {
      res.status(404).json({
        message: "FAQ Tidak Ditemukan",
      });
    } else {
      await faq.destroy({
        where: {
          id,
        },
      });
      res.status(200).json({
        message: "FAQ Berhasil Dihapus",
      });
    }
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: error.message,
    });
  }
};

module.exports = {
  getFaqs,
  getDetailFaq,
  createFaq,
  updateFaq,
  deleteFaq,
};
