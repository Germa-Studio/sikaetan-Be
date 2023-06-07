'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class dataPenyuluh extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  dataPenyuluh.init({
    namaProduct: DataTypes.STRING,
    desaBinaan: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'dataPenyuluh',
  });
  return dataPenyuluh;
};