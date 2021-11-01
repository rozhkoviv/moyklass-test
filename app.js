const express = require('express');
const log4js = require('log4js');

const Logger = log4js.getLogger('express-server');
Logger.level = (process.env.DEBUG) ? "debug" : "info";

const LessonsController = require('./controller/lessons.controller');

//========== PARAMS ==========
const HOST = process.env.HOST || "127.0.0.1";
const PORT = process.env.PORT || 8080;
//============================

const app = express();

app.use(express.json());

//========== CONTROLLERS ==========
app.use('/', LessonsController);
//=================================

module.exports.app = app;
module.exports.serverStart = () => {
    app.listen(PORT, HOST, () => {
        Logger.info(`Express server started on http://${HOST}:${PORT}`);
    });
};