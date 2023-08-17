'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class chart extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.dataChart, { foreignKey: 'dataChartId' });
    }
  }
  chart.init({
    judul: DataTypes.STRING,
    type: DataTypes.STRING,
    dataChartId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'chart',
  });
  return chart;
};