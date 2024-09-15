'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class desaBinaan extends Model {
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
      this.belongsTo(models.desa, {
        foreignKey: 'desaId',
        targetKey: 'id'
      });
    }
  }
  desaBinaan.init(
    {
      penyuluhId: DataTypes.NUMBER,
      desaId: DataTypes.NUMBER
    },
    {
      sequelize,
      modelName: 'desaBinaan'
    }
  );
  return desaBinaan;
};
