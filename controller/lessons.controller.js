const { LessonsService } = require("../service/lessons.service");

module.exports.LessonsController = class LessonsController {

    constructor(app) {
        this.lessonsService = new LessonsService();

        app.get('/', (req, res) => this.getAll(req, res))
    }

    async getAll(req, res) {
        try {
            res.send( await this.lessonsService.getAllWithFilter(req.query) );
        } catch (ex) {
            res.status(400).send({error: ex.message});
        }
    }
}