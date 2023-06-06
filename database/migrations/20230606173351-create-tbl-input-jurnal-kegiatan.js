'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('tbl_input_jurnal_kegiatans', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      kode_jurnal: {
        type: Sequelize.STRING
      },
      email: {
        type: Sequelize.STRING
      },
      kategori_jurnal: {
        type: Sequelize.STRING
      },
      judul_jurnal: {
        type: Sequelize.STRING
      },
      isi_jurnal: {
        type: Sequelize.STRING
      },
      tanggal: {
        type: Sequelize.DATE
      },
      gambar: {
        type: Sequelize.STRING
      },
      status_jurnal: {
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
    await queryInterface.dropTable('tbl_input_jurnal_kegiatans');
  }
};