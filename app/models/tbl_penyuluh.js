'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class tbl_penyuluh extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  tbl_penyuluh.init({
    kode_absen: DataTypes.STRING,
    email: DataTypes.STRING,
    waktu_hadir: DataTypes.DATE,
    id_kecamatan: DataTypes.STRING,
    keterangan: DataTypes.TEXT,
    status: DataTypes.STRING,
    gambar: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'tbl_penyuluh',
  });
  return tbl_penyuluh;
};