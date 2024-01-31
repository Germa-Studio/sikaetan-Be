"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("dataPenyuluhs", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      nik: {
        type: Sequelize.STRING,
      },
      nama: {
        type: Sequelize.STRING,
      },
      foto: {
        type: Sequelize.TEXT,
      },
      alamat: {
        type: Sequelize.TEXT,
      },
      email: {
        type: Sequelize.STRING,
      },
      noTelp: {
        type: Sequelize.STRING,
      },
      password: {
        type: Sequelize.STRING,
      },
      namaProduct: {
        type: Sequelize.STRING,
      },
      kecamatan: {
        type: Sequelize.STRING,
      },
      desa: {
        type: Sequelize.STRING,
      },
      desaBinaan: {
        type: Sequelize.STRING,
      },
      kecamatanBinaan: {
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
    await queryInterface.dropTable("dataPenyuluhs");
  },
};
