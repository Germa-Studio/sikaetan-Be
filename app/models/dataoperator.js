"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
	class dataOperator extends Model {
		static associate(models) {
			// define association here
			//   this.belongsTo(models.tbl_akun, {foreignKey: "fk_accountID"});
			this.belongsTo(models.kelompok, { foreignKey: "fk_kelompokID" });
		}
	}
	dataOperator.init(
		{
			nik: DataTypes.STRING,
			nkk: DataTypes.STRING,
			nama: DataTypes.STRING,
			email: DataTypes.STRING,
			noTelp: DataTypes.STRING,
			foto: DataTypes.TEXT,
			alamat: DataTypes.TEXT,
			accountID: DataTypes.STRING,
			password: DataTypes.STRING,
		},
		{
			sequelize,
			paranoid: true,
			modelName: "dataOperator",
			tableName: "dataOperators",
		}
	);
	return dataOperator;
};
