'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('desaBinaans', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      penyuluhId: {
        type: Sequelize.INTEGER
      },
      desaId: {
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

    await queryInterface.addConstraint('desaBinaans', {
      fields: ['penyuluhId', 'desaId'],
      type: 'unique',
      name: 'unique_penyuluhId_desaId'
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('desaBinaans');
  }
};
