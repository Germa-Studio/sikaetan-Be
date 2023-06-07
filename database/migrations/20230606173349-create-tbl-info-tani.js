'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('tbl_info_tani', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      kode_info: {
        type: Sequelize.STRING
      },
      email: {
        type: Sequelize.STRING
      },
      judul_info: {
        type: Sequelize.STRING
      },
      info: {
        type: Sequelize.STRING
      },
      kategori: {
        type: Sequelize.STRING
      },
      status: {
        type: Sequelize.STRING
      },
      tanggal: {
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
    await queryInterface.dropTable('tbl_info_tani');
  }
};