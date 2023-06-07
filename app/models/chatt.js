'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class chatt extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  chatt.init({
    dari: DataTypes.INTEGER,
    tujuan: DataTypes.STRING,
    aksi: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'chatt',
  });
  return chatt;
};