const { LessonsService } = require("../service/lessons.service");
const express = require('express');
const router = express.Router();

const lessonsService = new LessonsService();

router.get('/', async (req, res) => {
    try {
        res.send( await lessonsService.getAllWithFilter(req.query) );
    } catch (ex) {
        res.status(400).send({error: ex.message});
    }
});

router.post('/lessons', async (req, res) => {
    try {
        res.send( await lessonsService.createLessons(req.body) );
    } catch (ex) {
        res.status(400).send({ error: ex.message })
    }
});

module.exports = router;