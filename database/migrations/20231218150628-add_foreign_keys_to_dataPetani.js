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
    await queryInterface.addColumn('datapetanis', 'fk_penyuluhId', {
      type: Sequelize.INTEGER,
      references: {
        model: 'datapenyuluhs',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });
    await queryInterface.addColumn('datapetanis', 'fk_kelompokId', {
      type: Sequelize.INTEGER,
      references: {
        model: 'kelompoks',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *s
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.removeConstraint('datapetanis', 'fk_penyuluhId');
    await queryInterface.removeConstraint('kelompoks', 'fk_kelompokId');
  }
};
