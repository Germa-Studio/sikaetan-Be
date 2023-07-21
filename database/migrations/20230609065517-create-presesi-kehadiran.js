'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('presesiKehadirans', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      dataPersonId:{
        type: Sequelize.INTEGER
      },
      tanggalPresesi: {
        type: Sequelize.DATE
      },
      judulKegiatan: {
        type: Sequelize.STRING
      },
      deskripsiKegiatan: {
        type: Sequelize.STRING
      },
      FotoKegiatan: {
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
    await queryInterface.dropTable('presesiKehadirans');
  }
};