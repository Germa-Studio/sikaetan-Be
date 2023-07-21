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
      this.hasMany(models.laporanTanam, { foreignKey: 'tanamanPetaniId' });
      this.belongsTo(models.dataPerson, { foreignKey: 'dataPersonId' });
    }
  }
  tanamanPetani.init({
    dataPersonId: DataTypes.INTEGER,
    statusLahan: DataTypes.STRING,
    luasLahan: DataTypes.STRING,
    kategori: DataTypes.STRING,
    jenis: DataTypes.STRING,
    janisPanen: DataTypes.STRING,
    komoditas: DataTypes.STRING,
    musimTanam: DataTypes.INTEGER,
    tanggalTanam: DataTypes.STRING,
    perkiraanPanen: DataTypes.STRING,
    perkiraanHasilPanen: DataTypes.INTEGER,
    realisasiHasilPanen: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'tanamanPetani',
  });
  return tanamanPetani;
};