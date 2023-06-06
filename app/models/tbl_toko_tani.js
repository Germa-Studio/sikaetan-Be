'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class tbl_toko_tani extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  tbl_toko_tani.init({
    kode_produk: DataTypes.STRING,
    nama_produk: DataTypes.STRING,
    stok: DataTypes.INTEGER,
    satuan: DataTypes.STRING,
    harga: DataTypes.INTEGER,
    promo: DataTypes.INTEGER,
    gambar: DataTypes.STRING,
    status: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'tbl_toko_tani',
  });
  return tbl_toko_tani;
};