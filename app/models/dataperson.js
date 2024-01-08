"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
	class dataPerson extends Model {
		/**
		 * Helper method for defining associations.
		 * This method is not a part of Sequelize lifecycle.
		 * The `models/index` file will call this method automatically.
		 */
		static associate(models) {
			// define association here tanamanPetani
			this.belongsTo(models.kelompok, { foreignKey: "kelompokId" });
			// this.hasOne(models.dataPenyuluh, { foreignKey: 'id' });
			this.hasMany(models.penjual, { foreignKey: "id" });
			this.hasOne(models.chatt, { as: "from", foreignKey: "dari" });
			this.belongsTo(models.ratting, { foreignKey: "rattingId" });
			this.belongsTo(models.jurnalHarian, {
				foreignKey: "jurnalKegiatanId",
			});
			this.belongsTo(models.riwayatChat, { foreignKey: "riwayatChatId" });
			this.belongsTo(models.responseRating, {
				foreignKey: "responseRatingId",
			});
			this.hasMany(models.tanamanPetani, { foreignKey: "id" });
			this.hasMany(models.presesiKehadiran, { foreignKey: "id" });
			this.belongsToMany(models.chat, {
				through: "chatDataPerson",
				foreignKey: "id",
			});
			this.hasMany(models.chatDataPerson, { foreignKey: "id" });
		}
	}
	dataPerson.init(
		{
			NIK: DataTypes.STRING,
			NIP: DataTypes.STRING,
			foto: DataTypes.TEXT,
			NoWa: DataTypes.STRING,
			alamat: DataTypes.TEXT,
			desa: DataTypes.STRING,
			nama: DataTypes.STRING,
			kecamatan: DataTypes.STRING,
			role: DataTypes.STRING,
			password: DataTypes.TEXT,
			tanamanPetaniId: DataTypes.INTEGER,
			kelompokId: DataTypes.INTEGER,
			laporanTanamId: DataTypes.INTEGER,
			rattingId: DataTypes.INTEGER,
			presesiKehadiranId: DataTypes.INTEGER,
			jurnalKegiatanId: DataTypes.INTEGER,
			riwayatChatId: DataTypes.INTEGER,
			responseRatingId: DataTypes.INTEGER,
			verify: DataTypes.BOOLEAN,
		},
		{
			sequelize,
			modelName: "dataPerson",
			tableName: "dataPeople",
		}
	);
	return dataPerson;
};
