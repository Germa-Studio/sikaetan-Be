'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class riwayatChat extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  riwayatChat.init({
    chattMasuik: DataTypes.STRING,
    chattBelumDibales: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'riwayatChat',
  });
  return riwayatChat;
};