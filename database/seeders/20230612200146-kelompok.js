"use strict";

const kelompok = require("../buatSeeder/kelompok");
const bcrypt = require("bcrypt");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
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
      password: bcrypt.hashSync('haykal123',10),
      pekerjaan: 'admin',
      peran: 'super admin',
      foto: 'https://cdn.iconscout.com/icon/free/png-512/avatar-370-456322.png',
      accountID: 123456,
      isVerified: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },{
      email: 'joko@penyuluh.com',
      no_wa: '081546523232',
      nama: 'Joko',
      password: bcrypt.hashSync('joko123',10),
      pekerjaan:'',
      peran: 'penyuluh',
      accountID: 654123,
      foto: 'https://cdn.iconscout.com/icon/free/png-512/avatar-370-456322.png',
      createdAt: new Date(),
      updatedAt: new Date()
    },{
      email: 'dani@petani.com',
      no_wa: '08223259865',
      nama: 'Dani',
      password: bcrypt.hashSync('dani123',10),
      pekerjaan:'',
      peran: 'petani',
      foto: 'https://cdn.iconscout.com/icon/free/png-512/avatar-370-456322.png',
      accountID: 456123,
      createdAt: new Date(),
      updatedAt: new Date()
    }], {});
    await queryInterface.bulkInsert('datapenyuluhs', [{
      nik: '1234567890123456',
      foto: 'https://cdn.iconscout.com/icon/free/png-512/avatar-370-456322.png',
      nama: 'Joko',
      alamat: 'Jl. Jalan',
      desa: 'Wonosari',
      kecamatan: 'Sinen',
      desaBinaan: 'Wonosari',
      kecamatanBinaan: 'Sinen',
      email: 'joko@penyuluh.com',
      password: bcrypt.hashSync('joko123',10),
      noTelp: '123456789012',
      accountID: 654123,
      namaProduct: 'Ketan Merah',
      createdAt: new Date(),
      updatedAt: new Date()
    }], {});
    await queryInterface.bulkInsert('datapetanis', [{
      nik: '1234567890123456',
      nkk: '1234567890123456',
      foto: 'https://cdn.iconscout.com/icon/free/png-512/avatar-370-456322.png',
      nama: 'Dani',
      alamat: 'Jl. Jalan',
      desa: 'Wonosari',
      kecamatan: 'Sinen',
      email: 'dani@petani.com',
      password: bcrypt.hashSync('dani123',10),
      noTelp: '123456789012',
      accountID: 456123,
      fk_penyuluhId: 1,
      fk_kelompokId: 1,
      createdAt: new Date(),
      updatedAt: new Date()
    }], {});
    await queryInterface.bulkInsert('tanamanpetanis', [{
      statusKepemilikanLahan: 'MILIK SENDIRI',
      luasLahan: 200,
      kategori: 'TANAMAN PANGAN',
      jenis: 'JENIS SAYUR',
      komoditas: 'PADI',
      periodeMusimTanam: 'KEMARAU',
      periodeBulanTanam: 'AGUSTUS',
      prakiraanLuasPanen: 175,
      prakiraanProduksiPanen: 350,
      prakiraanBulanPanen: 'DESEMBER',
      fk_petaniId: 1,
      createdAt: new Date(),
      updatedAt: new Date()
    }], {});

  },

  async down(queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
  },
};
