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
      this.belongsTo(models.dataPerson, { foreignKey: 'dataPersonId' });
    }
  }
  dataPenyuluh.init({
    namaProduct: DataTypes.STRING,
    desaBinaan: DataTypes.STRING,
    kecamatanBinaan: DataTypes.STRING,
    dataPersonId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'dataPenyuluh',
  });
  return dataPenyuluh;
};