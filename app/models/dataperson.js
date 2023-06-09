'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class dataPerson extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here tanamanPetani
      this.belongsTo(models.tanamanPetani, { foreignKey: 'tanamanPetaniId' });
      this.belongsTo(models.kelompok, { foreignKey: 'kelompokId' });
      this.belongsTo(models.laporanTanam, { foreignKey: 'laporanTanamId' });
      this.belongsTo(models.dataPenyuluh, { foreignKey: 'dataPenyuluhId' });
      this.belongsTo(models.penjual, { foreignKey: 'penjualId' });
      this.hasMany(models.chatt, { foreignKey: 'dari' });
      this.hasMany(models.chatt, { foreignKey: 'tujuan' });
    }
  }
  dataPerson.init({
    NIK: DataTypes.STRING,
    NIP: DataTypes.STRING,
    foto: DataTypes.TEXT,
    NoWa: DataTypes.STRING,
    alamat: DataTypes.TEXT,
    desa: DataTypes.STRING,
    nama: DataTypes.STRING,
    kecamatan: DataTypes.STRING,
    password: DataTypes.TEXT,
    tanamanPetaniId: DataTypes.INTEGER,
    kelompokId: DataTypes.INTEGER,
    laporanTanamId: DataTypes.INTEGER,
    dataPenyuluhId: DataTypes.INTEGER,
    penjualId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'dataPerson',
  });
  return dataPerson;
};