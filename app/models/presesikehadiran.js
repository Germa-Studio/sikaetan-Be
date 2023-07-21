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
      this.belongsTo(models.dataPerson, { foreignKey: 'dataPersonId' });
    }
  }
  presesiKehadiran.init({
    dataPersonId: DataTypes.INTEGER,
    tanggalPresesi: DataTypes.DATE,
    judulKegiatan: DataTypes.STRING,
    deskripsiKegiatan: DataTypes.STRING,
    FotoKegiatan: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'presesiKehadiran',
  });
  return presesiKehadiran;
};