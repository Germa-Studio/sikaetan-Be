'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.addColumn('dataPetanis', 'fk_penyuluhId', {
      type: Sequelize.INTEGER,
      references: {
        model: 'dataPenyuluhs',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });
    await queryInterface.addColumn('dataPetanis', 'fk_kelompokId', {
      type: Sequelize.INTEGER,
      references: {
        model: 'kelompoks',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *s
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.removeConstraint('dataPetanis', 'fk_penyuluhId');
    await queryInterface.removeConstraint('dataPetanis', 'fk_kelompokId');
  }
};
