"use strict";
const { fakerID_ID: faker } = require("@faker-js/faker");

const kelompok = require("../buatSeeder/kelompok");
const crypto = require("crypto");
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
    const uuidPenyuluh = crypto.randomUUID();
    const uuidPetani = crypto.randomUUID();
    const datas = Array.from({ length: 5 }).map((_) => {
      const submitDate = faker.date.between({
        from: new Date(2023, 12, 1),
        to: new Date(),
      });
      return {
        kode_produk: faker.helpers
          .arrayElement(["A00123", "A000145", "A23568", "A123659", "A2365632"])
          .toUpperCase(),
        nama_produk: faker.helpers
          .arrayElement(["Ketan Merah", "Ketan Putih", "Ketan Hitam"])
          .toUpperCase(),
        stok: faker.number.int({
          min: 10,
          max: 500,
        }),
        harga: faker.number.int({
          min: 1000,
          max: 50000,
        }),
        satuan: faker.helpers.arrayElement(["Liter", "Kilo"]).toUpperCase(),
        gambar:
          "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Ftse4.mm.bing.net%2Fth%3Fid%3DOIP.L54dsN1a1lWBtdg7ptqQ1AHaEK%26pid%3DApi&f=1&ipt=689a0e979ff142900ab7486a45c29f62cc9381466cba3c307e79d7d54911cd8d&ipo=images",
        status: faker.helpers.arrayElement(["Habis", "Tersedia"]).toUpperCase(),
        createdAt: submitDate,
        updatedAt: submitDate,
      };
    });
    await queryInterface.bulkInsert("tbl_toko_tani", datas, {});
    await queryInterface.bulkInsert("kelompoks", kelompok, {});
    await queryInterface.bulkInsert(
      "tbl_akun",
      [
        {
          email: "haykal@admin.com",
          no_wa: "081234567890",
          nama: "Haykal",
          password: bcrypt.hashSync("haykal123", 10),
          pekerjaan: "admin",
          peran: "operator super admin",
          foto: "https://cdn.iconscout.com/icon/free/png-512/avatar-370-456322.png",
          accountID: crypto.randomUUID(),
          isVerified: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          email: "joko@penyuluh.com",
          no_wa: "081546523232",
          nama: "Joko",
          password: bcrypt.hashSync("joko123", 10),
          pekerjaan: "",
          peran: "penyuluh",
          accountID: uuidPenyuluh,
          isVerified: false,
          foto: "https://cdn.iconscout.com/icon/free/png-512/avatar-370-456322.png",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          email: "dani@petani.com",
          no_wa: "08223259865",
          nama: "Dani",
          password: bcrypt.hashSync("dani123", 10),
          pekerjaan: "",
          peran: "petani",
          isVerified: false,
          foto: "https://cdn.iconscout.com/icon/free/png-512/avatar-370-456322.png",
          accountID: uuidPetani,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {}
    );
    await queryInterface.bulkInsert(
      "dataOperators",
      [
        {
            nik: "1234567890123456",
            nkk: "1234567890123456",
            alamat: "Jl. Jalan",
            email: "haykal@admin.com",
            noTelp: "081234567890",
            nama: "Haykal",
            password: bcrypt.hashSync("haykal123", 10),
            // pekerjaan: "admin",
            // peran: "operator super admin",
            foto: "https://cdn.iconscout.com/icon/free/png-512/avatar-370-456322.png",
            accountID: crypto.randomUUID(),
            // isVerified: true,
            createdAt: new Date(),
            updatedAt: new Date(),
        }
      ]
    )
    await queryInterface.bulkInsert(
      "datapenyuluhs",
      [
        {
          nik: "1234567890123456",
          foto: "https://cdn.iconscout.com/icon/free/png-512/avatar-370-456322.png",
          nama: "Joko",
          alamat: "Jl. Jalan",
          desa: "Wonosari",
          kecamatan: "Sinen",
          desaBinaan: "Wonosari",
          kecamatanBinaan: "Sinen",
          email: "joko@penyuluh.com",
          password: bcrypt.hashSync("joko123", 10),
          noTelp: "123456789012",
          accountID: uuidPenyuluh,
          namaProduct: "Ketan Merah",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {}
    );
    await queryInterface.bulkInsert(
      "datapetanis",
      [
        {
          nik: "1234567890123456",
          nkk: "1234567890123456",
          foto: "https://cdn.iconscout.com/icon/free/png-512/avatar-370-456322.png",
          nama: "Dani",
          alamat: "Jl. Jalan",
          desa: "Wonosari",
          kecamatan: "Sinen",
          email: "dani@petani.com",
          password: bcrypt.hashSync("dani123", 10),
          noTelp: "123456789012",
          accountID: uuidPetani,
          fk_penyuluhId: 1,
          fk_kelompokId: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {}
    );
    await queryInterface.bulkInsert(
      "tanamanpetanis",
      [
        {
          statusKepemilikanLahan: "MILIK SENDIRI",
          luasLahan: 200,
          kategori: "TANAMAN PANGAN",
          jenis: "JENIS SAYUR",
          komoditas: "PADI",
          periodeMusimTanam: "KEMARAU",
          periodeBulanTanam: "AGUSTUS",
          prakiraanLuasPanen: 175,
          prakiraanProduksiPanen: 350,
          prakiraanBulanPanen: "DESEMBER",
          fk_petaniId: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {}
    );
    await queryInterface.bulkInsert(
      "beritatanis",
      [
        {
          judul: "Pemberdayaan Wanita di Dunia Pertanian",
          isi: "Program pemberdayaan wanita dalam sektor pertanian menjadi fokus utama untuk meningkatkan peran perempuan dalam rantai pasok pangan. Pelatihan, akses ke sumber daya, dan dukungan keuangan telah memberikan dampak positif pada keberlanjutan dan inklusivitas sektor pertanian.",
          kategori: "berita",
          tanggal: new Date(),
          fotoBerita:
            "https://spi.or.id/wp-content/uploads/2011/12/PP-lagi-3.jpg",
          createdBy: "Haykal",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          judul: "Pertanian Vertical: Solusi Masa Depan untuk Ketahanan Pangan",
          isi: "Konsep pertanian vertikal semakin mendapat perhatian sebagai solusi untuk meningkatkan ketahanan pangan di perkotaan. Dengan menggunakan ruang vertikal, petani dapat menghasilkan sayuran dan buah-buahan secara efisien, bahkan dalam lingkungan perkotaan yang terbatas.",
          kategori: "artikel",
          tanggal: new Date(),
          fotoBerita:
            "https://c2.staticflickr.com/2/1779/42225728250_16df0bbcac_z.jpg",
          createdBy: "Haykal",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {}
    );
    await queryInterface.bulkInsert(
      "eventtanis",
      [
        {
          namaKegiatan: "Webinar Vertical Farming",
          tanggalAcara: new Date(),
          waktuAcara: "08:00 - 15:00",
          tempat: "Balai Desa Sinen",
          peserta: "Petani Sinen",
          fotoKegiatan:
            "https://c2.staticflickr.com/2/1779/42225728250_16df0bbcac_z.jpg",
          createdBy: "Haykal",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {}
    );
    await queryInterface.bulkInsert("tbl_toko_tani", [
      {
        kode_produk: "A00123",
        nama_produk: "Ketan Merah",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
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
