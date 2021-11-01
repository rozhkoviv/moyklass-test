const log4js = require('log4js');
const Logger = log4js.getLogger("main");
Logger.level = (process.env.DEBUG)?"debug":"info";

const { assertDBConnection } = require('./db/index');
const { serverStart } = require('./app');

function main() {
    assertDBConnection()
        .then(serverStart);
}

main();