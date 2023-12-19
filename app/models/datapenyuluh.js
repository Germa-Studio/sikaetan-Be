'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class dataPenyuluh extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.hasMany(models.dataPetani, { foreignKey: 'fk_penyuluhId' });
    }
  }
  dataPenyuluh.init({
    nik: DataTypes.NUMBER,
    nama: DataTypes.STRING,
    foto: DataTypes.TEXT,
    alamat: DataTypes.TEXT,
    email: DataTypes.STRING,
    noTelp: DataTypes.NUMBER,
    password: DataTypes.STRING,
    namaProduct: DataTypes.STRING,
    kecamatan: DataTypes.STRING,
    desa: DataTypes.STRING,
    desaBinaan: DataTypes.STRING,
    kecamatanBinaan: DataTypes.STRING,
    accountID: DataTypes.NUMBER,
  }, {
    sequelize,
    modelName: 'dataPenyuluh',
  });
  return dataPenyuluh;
};