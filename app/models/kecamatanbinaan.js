'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class kecamatanBinaan extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.belongsTo(models.dataPenyuluh, {
        foreignKey: 'penyuluhId',
        targetKey: 'id'
      });
      this.belongsTo(models.kecamatan, {
        foreignKey: 'kecamatanId',
        targetKey: 'id'
      });
    }
  }
  kecamatanBinaan.init(
    {
      penyuluhId: DataTypes.NUMBER,
      kecamatanId: DataTypes.NUMBER
    },
    {
      sequelize,
      modelName: 'kecamatanBinaan'
    }
  );
  return kecamatanBinaan;
};
