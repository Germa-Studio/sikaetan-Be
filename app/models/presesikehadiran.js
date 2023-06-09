'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class presesiKehadiran extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  presesiKehadiran.init({
    tanggalPresesi: DataTypes.DATE,
    jamKedatangan: DataTypes.STRING,
    jamPulang: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'presesiKehadiran',
  });
  return presesiKehadiran;
};