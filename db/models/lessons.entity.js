const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
	sequelize.define('lessons', {
        id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
		lesson_id: {
			type: DataTypes.INTEGER
		},
		student_id: {
			type: DataTypes.STRING
		},
        visit: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        }
	});
}