const express = require('express');
const sequelize = require('./db');
const log4js = require('log4js');

////////////////// params 
const HOST = process.env.HOST || "127.0.0.1"
const PORT = process.env.PORT || 8080;
//////////////////

const Logger = log4js.getLogger();
Logger.level = "info";

const app = express();

async function assertDBConnection() {
    try {
        await sequelize.authenticate();
        Logger.info("Connected to db estabilished!");
    } catch (err) {
        Logger.error("Unable connect to the db");
        Logger.error(err);
        process.exit(1);
    }
}

async function main() {
    await assertDBConnection();

    app.listen(PORT, HOST, () => {
        Logger.info(`Express server started on http://${HOST}:${PORT}`);
    })
}

main();