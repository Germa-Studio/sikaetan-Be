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
      this.belongsTo(models.dataPetani, { foreignKey: 'fk_petaniId' });
    }
  }
  tanamanPetani.init({
    statusLahan: DataTypes.STRING,
    luasLahan: DataTypes.STRING,
    kategori: DataTypes.STRING,
    jenis: DataTypes.STRING,
    jenisPanen: DataTypes.STRING,
    komoditas: DataTypes.STRING,
    musimTanam: DataTypes.INTEGER,
    tanggalTanam: DataTypes.STRING,
    perkiraanPanen: DataTypes.STRING,
    perkiraanHasilPanen: DataTypes.INTEGER,
    realisasiHasilPanen: DataTypes.INTEGER,
    realisasiLuasLahan: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'tanamanPetani',
  });
  return tanamanPetani;
};