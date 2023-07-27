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
    await queryInterface.renameColumn('tanamanPetanis', 'janisPanen', 'jenisPanen');
    await queryInterface.addColumn('tanamanPetanis', 'realisasiLuasLahan', {
      type: Sequelize.STRING
    });
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.renameColumn('tanamanPetanis', 'jenisPanen', 'janisPanen');
    await queryInterface.removeColumn('tanamanPetanis', 'realisasiLuasLahan');
  }
};
