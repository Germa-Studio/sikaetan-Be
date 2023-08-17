'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class chatDataPerson extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.chat, { foreignKey: 'chatId' })
      this.belongsTo(models.dataPerson, { foreignKey: 'dataPersonId' })
    }
  }
  chatDataPerson.init({
    chatId: DataTypes.INTEGER,
    dataPersonId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'chatDataPerson',
  });
  return chatDataPerson;
};