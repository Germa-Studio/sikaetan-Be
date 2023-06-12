'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class tanamanPetani extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.hasOne(models.dataPerson, { foreignKey: 'tanamanPetaniId' });
    }
  }
  tanamanPetani.init({
    statusLahan: DataTypes.STRING,
    luasLahan: DataTypes.STRING,
    kategori: DataTypes.STRING,
    jenis: DataTypes.STRING,
    komoditas: DataTypes.STRING,
    musimTanam: DataTypes.INTEGER,
    tanggalTanam: DataTypes.DATE,
    perkiraanPanen: DataTypes.DATE,
    perkiraanHasilPanen: DataTypes.INTEGER,
    realisasiHasilPanen: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'tanamanPetani',
  });
  return tanamanPetani;
};