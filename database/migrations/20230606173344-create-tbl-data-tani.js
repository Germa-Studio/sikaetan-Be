'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('tbl_data_tanis', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      id_data_tani: {
        type: Sequelize.STRING
      },
      tanggal_data_tani: {
        type: Sequelize.DATE
      },
      id_kecamatan: {
        type: Sequelize.STRING
      },
      komoditas: {
        type: Sequelize.STRING
      },
      kategori: {
        type: Sequelize.STRING
      },
      jumlah: {
        type: Sequelize.STRING
      },
      luas_lahan: {
        type: Sequelize.STRING
      },
      musim_tanam: {
        type: Sequelize.STRING
      },
      file: {
        type: Sequelize.STRING
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
    await queryInterface.dropTable('tbl_data_tanis');
  }
};