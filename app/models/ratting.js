'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ratting extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.hasOne(models.dataPerson, { foreignKey: 'rattingId' });
    }
  }
  ratting.init({
    response: DataTypes.INTEGER,
    dataPersonId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'ratting',
  });
  return ratting;
};