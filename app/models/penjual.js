'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class penjual extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.hasMany(models.dataPerson, { foreignKey: 'penjualId' });
    }
  }
  penjual.init({
    profesiPenjual : DataTypes.STRING,
    namaProducts: DataTypes.STRING,
    stok: DataTypes.INTEGER,
    satuan: DataTypes.STRING,
    harga: DataTypes.STRING,
    deskripsi: DataTypes.STRING,
    fotoTanaman: DataTypes.TEXT,
    status: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'penjual',
  });
  return penjual;
};