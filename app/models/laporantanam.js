"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
	class laporanTanam extends Model {
		/**
		 * Helper method for defining associations.
		 * This method is not a part of Sequelize lifecycle.
		 * The `models/index` file will call this method automatically.
		 */
		static associate(models) {
			// define association here
			this.belongsTo(models.tanamanPetani, {
				foreignKey: "tanamanPetaniId",
			});
		}
	}
	laporanTanam.init(
		{
			tanamanPetaniId: DataTypes.INTEGER,
			tanggalLaporan: DataTypes.DATE,
			komdisiTanaman: DataTypes.STRING,
			deskripsi: DataTypes.TEXT,
			fotoTanaman: DataTypes.TEXT,
		},
		{
			sequelize,
			paranoid: true,
			modelName: "laporanTanam",
		}
	);
	return laporanTanam;
};
