"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("tbl_akun", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      email: {
        type: Sequelize.STRING,
      },
      no_wa: {
        type: Sequelize.STRING,
      },
      nama: {
        type: Sequelize.STRING,
      },
      password: {
        type: Sequelize.STRING,
      },
      pekerjaan: {
        type: Sequelize.STRING,
      },
      peran: {
        type: Sequelize.STRING,
      },
      foto: {
        type: Sequelize.STRING,
      },
      accountID: {
        type: Sequelize.STRING,
      },
      isVerified: {
        type:Sequelize.BOOLEAN
        , defaultValue: false
        , allowNull: false
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("tbl_akun");
  },
};
