'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('beritaTanis', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      judul: {
        type: Sequelize.STRING
      },
      tanggal: {
        type: Sequelize.DATE
      },
      status: {
        type: Sequelize.STRING
      },
      kategori: {
        type: Sequelize.STRING
      },
      fotoBerita: {
        type: Sequelize.TEXT
      },
      createdBy: {
        type: Sequelize.STRING
      },
      isi: {
        type: Sequelize.TEXT
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
    await queryInterface.dropTable('beritaTanis');
  }
};