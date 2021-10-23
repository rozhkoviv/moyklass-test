const Sequelize = require('sequelize');
const relations = require('./relations');

////////////////// params 
const DB_HOST = process.env.DB_HOST || '127.0.0.1';
const DB_USERNAME = process.env.DB_USERNAME || 'test';
const DB_PASSWORD = process.env.DB_PASSWORD || 'test'
const DB_NAME = process.env.DB_NAME || 'moyklass';
const DB_LOGGING = process.env.DB_LOGGING || false;
//////////////////

const sequelize = new Sequelize(DB_NAME, DB_USERNAME, DB_PASSWORD, {
    host: DB_HOST,
    dialect: 'postgres',
    logging: DB_LOGGING
});

const entityDefiners = [
    /*require('./models/lesson_students.entity'),
    require('./models/lesson_teachers.entity'),
    require('./models/lessons.entity'),
    require('./models/students.entity'),*/
    require('./models/teachers.entity')
]

entityDefiners.forEach(entity => entity(sequelize));

relations(sequelize);

module.exports = sequelize;