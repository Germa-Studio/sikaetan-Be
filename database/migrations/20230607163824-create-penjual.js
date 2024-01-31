"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("penjuals", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      profesiPenjual: {
        type: Sequelize.STRING,
      },
      namaProducts: {
        type: Sequelize.STRING,
      },
      stok: {
        type: Sequelize.INTEGER,
      },
      satuan: {
        type: Sequelize.STRING,
      },
      harga: {
        type: Sequelize.STRING,
      },
      deskripsi: {
        type: Sequelize.STRING,
      },
      fotoTanaman: {
        type: Sequelize.TEXT,
      },
      status: {
        type: Sequelize.STRING,
      },
      accountID: {
        unique: true,
        type: Sequelize.UUID,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("penjuals");
  },
};
