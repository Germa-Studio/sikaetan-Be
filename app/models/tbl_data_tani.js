'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class tbl_data_tani extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  tbl_data_tani.init({
    id_data_tani: DataTypes.STRING,
    tanggal_data_tani: DataTypes.DATE,
    id_kecamatan: DataTypes.STRING,
    komoditas: DataTypes.STRING,
    kategori: DataTypes.STRING,
    jumlah: DataTypes.STRING,
    luas_lahan: DataTypes.STRING,
    musim_tanam: DataTypes.STRING,
    file: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'tbl_data_tani',
  });
  return tbl_data_tani;
};