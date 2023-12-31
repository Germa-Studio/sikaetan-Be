"use strict";
const { fakerID_ID: faker } = require("@faker-js/faker");

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
    const datas = Array.from({ length: 1000 }).map((_) => {
      const submitDate = faker.date.between({
        from: new Date(2023, 1, 1),
        to: new Date(),
      });
      return {
        statusKepemilikanLahan: faker.helpers
          .arrayElement(["milik sendiri", "sewa", "pinjam"])
          .toUpperCase(),
        luasLahan: faker.number.int({
          min: 100,
          max: 500,
        }),
        kategori: faker.helpers
          .arrayElement([
            "tanaman pangan",
            "tanaman perkebunan",
            "tanaman holtikultura",
          ])
          .toUpperCase(),
        jenis: faker.helpers.arrayElement(["buah", "sayur"]).toUpperCase(),
        komoditas: faker.helpers
          .arrayElement([
            "padi konvensional",
            "padi ramah lingkungan",
            "padi organik",
            "jagung",
            "kedelai",
            "ubi jalar",
            "ubi kayu",
            "kacang tanah",
            "kacang hijau",
          ])
          .toUpperCase(),
        periodeMusimTanam: faker.helpers
          .arrayElement(["hujan", "kemarau"])
          .toUpperCase(),
        periodeBulanTanam: faker.helpers
          .arrayElement([
            "januari",
            "februari",
            "maret",
            "april",
            "mei",
            "juni",
            "juli",
            "agustus",
            "september",
            "oktober",
            "november",
            "desember",
          ])
          .toUpperCase(),
        prakiraanLuasPanen: faker.number.int({
          min: 100,
          max: 500,
        }),
        prakiraanProduksiPanen: faker.number.int({
          min: 0,
          max: 500,
        }),
        prakiraanBulanPanen: faker.helpers
          .arrayElement([
            "januari",
            "februari",
            "maret",
            "april",
            "mei",
            "juni",
            "juli",
            "agustus",
            "september",
            "oktober",
            "november",
            "desember",
          ])
          .toUpperCase(),
        fk_petaniId: 1,
        createdAt: submitDate,
        updatedAt: submitDate,
      };
    });
    await queryInterface.bulkInsert("tanamanPetanis", datas, {});
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */

    await queryInterface.bulkDelete("tanamanPetanis", null, {});
  },
};
