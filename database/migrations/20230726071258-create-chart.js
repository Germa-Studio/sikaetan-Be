'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('charts', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      label: {
        type: Sequelize.STRING
      },
      total: {
        type: Sequelize.INTEGER
      },
      tanggalPanen: {
        type: Sequelize.DATE
      },
      jenis: {
        type: Sequelize.ENUM('Buah-Buahan', 'Sayuran')
      },
      jenisPanen: {
        type: Sequelize.ENUM('Tahunan', 'Bulanan')
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
    await queryInterface.dropTable('charts');
  }
};