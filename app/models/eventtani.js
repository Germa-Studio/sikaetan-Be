'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class eventTani extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  eventTani.init({
    namaKegiatan: DataTypes.STRING,
    tanggalAcara: DataTypes.DATE,
    waktuAcara: DataTypes.STRING,
    tempat: DataTypes.STRING,
    peserta: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'eventTani',
  });
  return eventTani;
};