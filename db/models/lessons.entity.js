const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
	sequelize.define('lessons', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
			autoIncrement: true,
            allowNull: false
        },
		date: {
			type: DataTypes.DATE,
            allowNull: false
		},
		title: {
			type: DataTypes.STRING
		},
        status: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        }
	});
}