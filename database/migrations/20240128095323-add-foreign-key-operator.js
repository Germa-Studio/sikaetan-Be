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
    // await queryInterface.addColumn('dataOperators', 'fk_accountID', {
    //   type: Sequelize.UUID,
    //   allowNull: false,
    //   references: {
    //     model: 'tbl_akun',
    //     key: 'accountID',
    //   },
    //   onUpdate: 'CASCADE',
    //   onDelete: 'SET NULL',
    // });
    await queryInterface.addColumn('dataOperators', 'fk_kelompokID', {
      type: Sequelize.INTEGER,
      references: {
        model: 'kelompoks',
        key: 'id',
      },
    })
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    // await queryInterface.removeConstraint('dataOperators', 'fk_accountID');
    await queryInterface.removeConstraint('dataOperators', 'fk_kelompokID');
  }
};
