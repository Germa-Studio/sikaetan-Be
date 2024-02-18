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
		await queryInterface.addColumn("beritaTanis", "deletedAt", {
			type: Sequelize.DATE,
			allowNull: true,
		});
		// done
		await queryInterface.addColumn("eventTanis", "deletedAt", {
			type: Sequelize.DATE,
			allowNull: true,
		});
		// done
		await queryInterface.addColumn("dataOperators", "deletedAt", {
			type: Sequelize.DATE,
			allowNull: true,
		});
		// done
		await queryInterface.addColumn("dataPenyuluhs", "deletedAt", {
			type: Sequelize.DATE,
			allowNull: true,
		});
		// done
		await queryInterface.addColumn("dataPetanis", "deletedAt", {
			type: Sequelize.DATE,
			allowNull: true,
		});
		// done wait for confirmation
		await queryInterface.addColumn("dataTanamans", "deletedAt", {
			type: Sequelize.DATE,
			allowNull: true,
		});
		// done
		await queryInterface.addColumn("jurnalHarians", "deletedAt", {
			type: Sequelize.DATE,
			allowNull: true,
		});
		// done
		await queryInterface.addColumn("laporanTanams", "deletedAt", {
			type: Sequelize.DATE,
			allowNull: true,
		});
		// done
		await queryInterface.addColumn("penjuals", "deletedAt", {
			type: Sequelize.DATE,
			allowNull: true,
		});
		// done
		await queryInterface.addColumn("tanamanPetanis", "deletedAt", {
			type: Sequelize.DATE,
			allowNull: true,
		});
		// done
		await queryInterface.addColumn("tbl_akun", "deletedAt", {
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

		await queryInterface.removeColumn("beritaTanis", "deletedAt");
		await queryInterface.removeColumn("eventTanis", "deletedAt");
		await queryInterface.removeColumn("dataOperators", "deletedAt");
		await queryInterface.removeColumn("dataPenyuluhs", "deletedAt");
		await queryInterface.removeColumn("dataPetanis", "deletedAt");
		await queryInterface.removeColumn("dataTanamans", "deletedAt");
		await queryInterface.removeColumn("jurnalHarians", "deletedAt");
		await queryInterface.removeColumn("laporanTanams", "deletedAt");
		await queryInterface.removeColumn("penjuals", "deletedAt");
		await queryInterface.removeColumn("tanamanPetanis", "deletedAt");
		await queryInterface.removeColumn("tbl_akun", "deletedAt");
	},
};
