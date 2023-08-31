'use strict';
const {
  Model, STRING
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class message extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.attachment, { foreignKey: 'attachmentId' });
    }
  }
  message.init({
    attachmentId: DataTypes.INTEGER,
    pesan: DataTypes.TEXT,
    chatId: DataTypes.INTEGER,
    fromId: DataTypes.INTEGER,
    waktu: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'message',
  });
  return message;
};