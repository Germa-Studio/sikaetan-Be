"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class tbl_akun extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  tbl_akun.init({
    email: DataTypes.STRING,
    no_wa: DataTypes.STRING,
    nama: DataTypes.STRING,
    password: DataTypes.STRING,
    pekerjaan: DataTypes.STRING,
    peran: DataTypes.STRING,
    foto: DataTypes.STRING,
    accountID: DataTypes.NUMBER,
    isVerified: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'tbl_akun',
    tableName:'tbl_akun'
  });
  return tbl_akun;
};
