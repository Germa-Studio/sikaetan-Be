'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class tbl_kecamatan extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  tbl_kecamatan.init({
    id_kecamatan: DataTypes.STRING,
    kecamatan: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'tbl_kecamatan',
  });
  return tbl_kecamatan;
};