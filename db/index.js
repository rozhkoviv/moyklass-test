const Sequelize = require('sequelize');
const relations = require('./relations');
const log4js = require('log4js');

const Logger = log4js.getLogger('database');
Logger.level = (process.env.DEBUG) ? "debug" : "info";

//========== PARAMS ==========
const DB_HOST = process.env.DB_HOST || '127.0.0.1';
const DB_USERNAME = process.env.DB_USERNAME || 'test';
const DB_PASSWORD = process.env.DB_PASSWORD || 'test';
const DB_NAME = process.env.DB_NAME || 'moyklass';
const DB_LOGGING = process.env.DB_LOGGING;
//============================

const sequelize = new Sequelize(DB_NAME, DB_USERNAME, DB_PASSWORD, {
    host: DB_HOST,
    dialect: 'postgres',
    logging: DB_LOGGING ? console.log : false,
    define: {
        timestamps: false
    }
});

const entityDefiners = [
    require('./models/lesson_students.entity'),
    require('./models/lesson_teachers.entity'),
    require('./models/lessons.entity'),
    require('./models/students.entity'),
    require('./models/teachers.entity')
];

entityDefiners.forEach(entity => entity(sequelize));

relations(sequelize);

async function assertDBConnection() {
    try {
        await sequelize.authenticate();
        Logger.debug("Connected to db estabilished!");
    } catch (err) {
        Logger.error("Unable connect to the db");
        Logger.error(err);
        process.exit(1);
    }
}

module.exports.assertDBConnection = assertDBConnection;
module.exports.sequelize = sequelize;