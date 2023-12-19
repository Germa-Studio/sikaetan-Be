'use strict';

const kelompok = require('../buatSeeder/kelompok')


/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
    */
     await queryInterface.bulkInsert('kelompoks', kelompok, {});
     await queryInterface.bulkInsert('tbl_akun', [{
      email: 'haykal@admin.com',
      no_wa: '081234567890',
      nama: 'Haykal',
      password: 'haykal123',
      pekerjaan: 'admin',
      peran: 'super admin',
      foto: 'https://cdn.iconscout.com/icon/free/png-512/avatar-370-456322.png',
      createdAt: new Date(),
      updatedAt: new Date()
    }], {});
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
  }
};
