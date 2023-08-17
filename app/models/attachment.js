'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class attachment extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.hasOne(models.attachment, { foreignKey: 'attachmentId' })
    }
  }
  attachment.init({
    type: DataTypes.STRING,
    link: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'attachment',
  });
  return attachment;
};