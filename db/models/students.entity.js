const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
	sequelize.define('students', {
		id: {
			type: DataTypes.INTEGER,
            allowNull: false
		},
		name: {
			type: DataTypes.STRING
		}
	});
}