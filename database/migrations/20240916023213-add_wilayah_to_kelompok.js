'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.addColumn('kelompoks', 'kecamatanId', {
      type: Sequelize.INTEGER,
      references: {
        model: 'kecamatans',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });
    await queryInterface.addColumn('kelompoks', 'desaId', {
      type: Sequelize.INTEGER,
      references: {
        model: 'desas',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.removeColumn('kelompoks', 'kecamatanId');
    await queryInterface.removeColumn('kelompoks', 'desaId');
  }
};
