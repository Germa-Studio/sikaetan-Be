'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class desa extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.belongsTo(models.kecamatan, {
        foreignKey: 'kecamatanId'
      });
    }
  }
  desa.init(
    {
      nama: DataTypes.STRING,
      kecamatanId: DataTypes.INTEGER,
      type: DataTypes.ENUM('Desa', 'Kelurahan')
    },
    {
      sequelize,
      modelName: 'desa'
    }
  );
  return desa;
};
