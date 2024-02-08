"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
	class penjual extends Model {
		/**
		 * Helper method for defining associations.
		 * This method is not a part of Sequelize lifecycle.
		 * The `models/index` file will call this method automatically.
		 */
		static associate(models) {
			// define association here
			this.belongsTo(models.tbl_akun, {
				foreignKey: "accountID",
				targetKey: "accountID",
			});
		}
	}
	penjual.init(
		{
			profesiPenjual: DataTypes.STRING,
			namaProducts: DataTypes.STRING,
			stok: DataTypes.INTEGER,
			satuan: DataTypes.STRING,
			harga: DataTypes.STRING,
			deskripsi: DataTypes.STRING,
			fotoTanaman: DataTypes.TEXT,
			status: DataTypes.STRING,
			accountID: DataTypes.UUID,
		},
		{
			sequelize,
			paranoid: true,
			modelName: "penjual",
		}
	);
	return penjual;
};
