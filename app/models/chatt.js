'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class chatt extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.dataPerson, { foreignKey: 'dari' });
      this.belongsTo(models.dataPerson, { foreignKey: 'tujuan' });
    }
  }
  chatt.init({
    dari: DataTypes.INTEGER,
    tujuan: DataTypes.INTEGER,
    aksi: DataTypes.STRING,
    status:string
  }, {
    sequelize,
    modelName: 'chatt',
  });
  return chatt;
};