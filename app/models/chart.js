'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class chart extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  chart.init({
    label: DataTypes.STRING,
    total: DataTypes.INTEGER,
    tanggalPanen: DataTypes.DATE,
    jenis: DataTypes.ENUM('Buah-Buahan', 'Sayuran'),
    jenisPanen: DataTypes.ENUM('Tahunan', 'Bulanan')
  }, {
    sequelize,
    modelName: 'chart',
  });
  return chart;
};