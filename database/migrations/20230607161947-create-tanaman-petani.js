'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('tanamanPetanis', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      statusLahan: {
        type: Sequelize.STRING
      },
      luasLahan: {
        type: Sequelize.STRING
      },
      kategori: {
        type: Sequelize.STRING
      },
      jenis: {
        type: Sequelize.STRING
      },
      komoditas: {
        type: Sequelize.STRING
      },
      musimTanam: {
        type: Sequelize.INTEGER
      },
      tanggalTanam: {
        type: Sequelize.DATE
      },
      perkiraanPanen: {
        type: Sequelize.DATE
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('tanamanPetanis');
  }
};