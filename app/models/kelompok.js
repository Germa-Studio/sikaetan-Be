'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class kelompok extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  kelompok.init({
    gapoktan: DataTypes.STRING,
    penyuluh: DataTypes.STRING,
    namaKelompok: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'kelompok',
  });
  return kelompok;
};