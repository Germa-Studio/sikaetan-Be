'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class tbl_list_belanja extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  tbl_list_belanja.init({
    kode_belanja: DataTypes.STRING,
    kode_produk: DataTypes.STRING,
    email: DataTypes.STRING,
    jumlah_beli: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'tbl_list_belanja',
  });
  return tbl_list_belanja;
};