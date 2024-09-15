'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('kecamatanBinaans', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      penyuluhId: {
        type: Sequelize.INTEGER
      },
      kecamatanId: {
        type: Sequelize.INTEGER
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

    await queryInterface.addConstraint('kecamatanBinaans', {
      fields: ['penyuluhId', 'kecamatanId'],
      type: 'unique',
      name: 'unique_penyuluhId_kecamatanId'
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('kecamatanBinaans');
  }
};
