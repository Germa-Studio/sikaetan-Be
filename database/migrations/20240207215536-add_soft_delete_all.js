"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		/**
		 * Add altering commands here.
		 *
		 * Example:
		 * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
		 */
		// done
		queryInterface.addColumn("beritatanis", "deletedAt", {
			type: Sequelize.DATE,
			allowNull: true,
		});
		// done
		queryInterface.addColumn("eventtanis", "deletedAt", {
			type: Sequelize.DATE,
			allowNull: true,
		});
		// done
		queryInterface.addColumn("dataoperators", "deletedAt", {
			type: Sequelize.DATE,
			allowNull: true,
		});
		// done
		queryInterface.addColumn("datapenyuluhs", "deletedAt", {
			type: Sequelize.DATE,
			allowNull: true,
		});
		// done
		queryInterface.addColumn("datapetanis", "deletedAt", {
			type: Sequelize.DATE,
			allowNull: true,
		});
		queryInterface.addColumn("datatanamans", "deletedAt", {
			type: Sequelize.DATE,
			allowNull: true,
		});
		queryInterface.addColumn("jurnalharians", "deletedAt", {
			type: Sequelize.DATE,
			allowNull: true,
		});
		queryInterface.addColumn("laporantanams", "deletedAt", {
			type: Sequelize.DATE,
			allowNull: true,
		});
		queryInterface.addColumn("penjuals", "deletedAt", {
			type: Sequelize.DATE,
			allowNull: true,
		});
		queryInterface.addColumn("tanamanpetanis", "deletedAt", {
			type: Sequelize.DATE,
			allowNull: true,
		});
		// done
		queryInterface.addColumn("tbl_akun", "deletedAt", {
			type: Sequelize.DATE,
			allowNull: true,
		});
	},

	async down(queryInterface, Sequelize) {
		/**
		 * Add reverting commands here.
		 *
		 * Example:
		 * await queryInterface.dropTable('users');
		 */

		await queryInterface.removeColumn("beritatanis", "deletedAt");
		await queryInterface.removeColumn("eventtanis", "deletedAt");
		await queryInterface.removeColumn("dataoperators", "deletedAt");
		await queryInterface.removeColumn("datapenyuluhs", "deletedAt");
		await queryInterface.removeColumn("datapetanis", "deletedAt");
		await queryInterface.removeColumn("datatanamans", "deletedAt");
		await queryInterface.removeColumn("jurnalharians", "deletedAt");
		await queryInterface.removeColumn("laporantanams", "deletedAt");
		await queryInterface.removeColumn("penjuals", "deletedAt");
		await queryInterface.removeColumn("tanamanpetanis", "deletedAt");
		await queryInterface.removeColumn("tbl_akun", "deletedAt");
	},
};
