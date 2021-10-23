const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
	sequelize.define('lesson_teachers', {
		lesson_id: {
			type: DataTypes.INTEGER
		},
		teacher_id: {
			type: DataTypes.STRING
		}
	});
}