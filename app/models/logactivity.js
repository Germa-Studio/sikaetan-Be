"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
	class logactivity extends Model {
		/**
		 * Helper method for defining associations.
		 * This method is not a part of Sequelize lifecycle.
		 * The `models/index` file will call this method automatically.
		 */
		static associate(models) {
			// define association here
			this.belongsTo(models.tbl_akun, { foreignKey: "user_id" });
		}
	}
	logactivity.init(
		{
			user_id: DataTypes.NUMBER,
			activity: DataTypes.STRING,
			detail: DataTypes.STRING,
			// created_at: DataTypes.DATE,
			// updated_at: DataTypes.DATE,
		},
		{
			sequelize,
			modelName: "logactivity",
		}
	);
	return logactivity;
};
