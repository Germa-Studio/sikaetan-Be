"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("dataTanamans", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      kategori: {
        type: Sequelize.STRING,
      },
      komoditas: {
        type: Sequelize.STRING,
      },
      periodeTanam: {
        type: Sequelize.STRING,
      },
      luasLahan: {
        type: Sequelize.INTEGER,
      },
      prakiraanLuasPanen: {
        type: Sequelize.INTEGER,
      },
      prakiraanHasilPanen: {
        type: Sequelize.INTEGER,
      },
      prakiraanBulanPanen: {
        type: Sequelize.STRING,
      },
      realisasiLuasPanen: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      realisasiHasilPanen: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      fk_kelompokId: {
        type: Sequelize.INTEGER,
        references: {
          model: "kelompoks",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
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
    await queryInterface.dropTable("dataTanamans");
  },
};
