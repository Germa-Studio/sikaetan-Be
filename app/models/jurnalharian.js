'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class jurnalHarian extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.dataPenyuluh, { foreignKey: 'fk_penyuluhId' });
    }
  }
  jurnalHarian.init({
    judul: DataTypes.STRING,
    tanggalDibuat: DataTypes.DATE,
    uraian: DataTypes.TEXT,
    gambar: DataTypes.TEXT,
    statusJurnal: DataTypes.STRING,
    pengubah: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'jurnalHarian',
  });
  return jurnalHarian;
};