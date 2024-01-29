'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('jurnalHarians', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      judul: {
        type: Sequelize.STRING
      },
      tanggalDibuat: {
        type: Sequelize.DATE
      },
      uraian: {
        type: Sequelize.TEXT
      },
      gambar: {
        type: Sequelize.TEXT
      },
      statusJurnal: {
        type: Sequelize.STRING
      },
      pengubah: {
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
    await queryInterface.dropTable('jurnalHarians');
  }
};