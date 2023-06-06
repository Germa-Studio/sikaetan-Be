'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class tbl_input_jurnal_kegiatan extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  tbl_input_jurnal_kegiatan.init({
    kode_jurnal: DataTypes.STRING,
    email: DataTypes.STRING,
    kategori_jurnal: DataTypes.STRING,
    judul_jurnal: DataTypes.STRING,
    isi_jurnal: DataTypes.STRING,
    tanggal: DataTypes.DATE,
    gambar: DataTypes.STRING,
    status_jurnal: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'tbl_input_jurnal_kegiatan',
  });
  return tbl_input_jurnal_kegiatan;
};