'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class tbl_info_tani extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  tbl_info_tani.init({
    kode_info: DataTypes.STRING,
    email: DataTypes.STRING,
    judul_info: DataTypes.STRING,
    info: DataTypes.STRING,
    kategori: DataTypes.STRING,
    status: DataTypes.STRING,
    tanggal: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'tbl_info_tani',
  });
  return tbl_info_tani;
};