'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('dataPeople', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      NIK: {
        type: Sequelize.STRING
      },
      NIP: {
        type: Sequelize.STRING
      },
      NoWa: {
        type: Sequelize.STRING
      },
      alamat: {
        type: Sequelize.TEXT
      },
      foto: {
        type: Sequelize.TEXT
      }, 
      desa: {
        type: Sequelize.STRING
      },
      nama: {
        type: Sequelize.STRING
      },
      kecamatan: {
        type: Sequelize.STRING
      },
      role: {
        type: Sequelize.STRING
      },
      password: {
        type: Sequelize.TEXT
      },
      tanamanPetaniId: {
        type: Sequelize.INTEGER
      },
      kelompokId: {
        type: Sequelize.INTEGER
      },
      laporanTanamId: {
        type: Sequelize.INTEGER
      },
      rattingId: {
        type: Sequelize.INTEGER
      },
      presesiKehadiranId: {
        type: Sequelize.INTEGER
      },
      jurnalKegiatanId: {
        type: Sequelize.INTEGER
      },
      riwayatChatId: {
        type: Sequelize.INTEGER
      },
      responseRatingId: {
        type: Sequelize.INTEGER
      },
      createdAt: {
        allowNull: true,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: true,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('dataPeople');
  }
};