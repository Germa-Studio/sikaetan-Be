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
    const tanamanDatas = Array.from({ length: 1000 }).map((_) => {
      const submitDate = faker.date.between({
        from: new Date(2023, 1, 1),
        to: new Date(),
      });
      return {
        kategori: faker.helpers
          .arrayElement([
            "Tanaman Pangan",
            "Tanaman Perkebunan",
            "Hortikultura",
          ])
          .toUpperCase(),
        komoditas: faker.helpers.arrayElement([
          "Padi Konvensional",
          "Padi Ramah Lingkungan",
          "Padi Organik",
          "Jagung",
          "Kedelai",
          "Ubi Jalar",
          "Ubi Kayu",
          "Kacang Tanah",
          "Kacang Hijau",
        ]),
        periodeTanam: faker.helpers.arrayElement([
          "Januari",
          "Februari",
          "Maret",
          "April",
          "Mei",
          "Juni",
          "Juli",
          "Agustus",
          "September",
          "Oktober",
          "November",
          "Desember",
        ]),
        luasLahan: faker.number.int({
          min: 100,
          max: 500,
        }),
        // jenis: faker.helpers.arrayElement(["buah", "sayur"]).toUpperCase(),
        prakiraanLuasPanen: faker.number.int({
          min: 100,
          max: 500,
        }),
        realisasiLuasPanen: faker.number.int({
          min: 100,
          max: 500,
        }),
        prakiraanHasilPanen: faker.number.int({
          min: 0,
          max: 500,
        }),
        realisasiHasilPanen: faker.number.int({
          min: 0,
          max: 500,
        }),
        prakiraanBulanPanen: faker.helpers.arrayElement([
          "Januari",
          "Februari",
          "Maret",
          "April",
          "Mei",
          "Juni",
          "Juli",
          "Agustus",
          "September",
          "Oktober",
          "November",
          "Desember",
        ]),
        realisasiBulanPanen: faker.helpers.arrayElement([
          "Januari",
          "Februari",
          "Maret",
          "April",
          "Mei",
          "Juni",
          "Juli",
          "Agustus",
          "September",
          "Oktober",
          "November",
          "Desember",
        ]),
        fk_kelompokId: 1,
        createdAt: submitDate,
        updatedAt: submitDate,
      };
    });
    await queryInterface.bulkInsert("dataTanamans", tanamanDatas, {});
    const datas = Array.from({ length: 50 }).map((_) => {
      const submitDate = faker.date.between({
        from: new Date(2023, 1, 1),
        to: new Date(),
      });
      return {
        statusKepemilikanLahan: faker.helpers
          .arrayElement(["MILIK SENDIRI", "TANAH SEWA"])
          .toUpperCase(),
        luasLahan: faker.number.int({
          min: 100,
          max: 500,
        }),
        kategori: faker.helpers
          .arrayElement([
            "Tanaman Pangan",
            "Tanaman Perkebunan",
            "Hortikultura",
          ])
          .toUpperCase(),
        jenis: faker.helpers.arrayElement(["buah", "sayur"]).toUpperCase(),
        komoditas: faker.helpers.arrayElement([
          "Padi Konvensional",
          "Padi Ramah Lingkungan",
          "Padi Organik",
          "Jagung",
          "Kedelai",
          "Ubi Jalar",
          "Ubi Kayu",
          "Kacang Tanah",
          "Kacang Hijau",
        ]),
        periodeMusimTanam: faker.helpers.arrayElement([
          "Tanaman Semusim",
          "Tanaman Tahunan",
        ]),
        periodeBulanTanam: faker.helpers.arrayElement([
          "Januari",
          "Februari",
          "Maret",
          "April",
          "Mei",
          "Juni",
          "Juli",
          "Agustus",
          "September",
          "Oktober",
          "November",
          "Desember",
        ]),
        prakiraanLuasPanen: faker.number.int({
          min: 100,
          max: 500,
        }),
        prakiraanProduksiPanen: faker.number.int({
          min: 0,
          max: 500,
        }),
        prakiraanBulanPanen: faker.helpers.arrayElement([
          "Januari",
          "Februari",
          "Maret",
          "April",
          "Mei",
          "Juni",
          "Juli",
          "Agustus",
          "September",
          "Oktober",
          "November",
          "Desember",
        ]),
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
