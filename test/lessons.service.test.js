const chai = require('chai');
const chaiHttp = require('chai-http');

chai.use(chaiHttp);
chai.should();

const { sequelize } = require('../db');
const { app } = require('../app');

describe('Testing Lessons controller: ', () => {
   before((done) => {
       sequelize.authenticate().then(() => done()).catch(ex => done(ex));
   });

   it('GET / (should return array of lessons with length <= 5 by default)', (done) => {
       chai.request(app)
           .get('/')
           .end((err, res) => {
               res.should.have.status(200);
               res.body.should.be.a('array').length.lessThanOrEqual(5);
               done();
           })
   });

   it('POST /lessons (creating lessons without params)', (done) => {
       chai.request(app)
           .post('/lessons')
           .end((err, res) => {
               res.should.have.status(400);
               done();
           })
   });

   it('POST /lessons (with lessonsCount)', (done) => {
       chai.request(app)
           .post('/lessons')
           .send(
               {
                   "teacherIds": [1, 2],
                   "title": "Blue ocean",
                   "days": [0],
                   "firstDate": "2019-02-31",
                   "lessonsCount": 19
               }
           )
           .end((err, res) => {
               res.should.have.status(200);
               res.body.should.be.a('array');
               done();
           })
   });

    it('POST /lessons (with lastDate)', (done) => {
        chai.request(app)
            .post('/lessons')
            .send(
                {
                    "teacherIds": [1, 2],
                    "title": "Blue ocean",
                    "days": [0],
                    "firstDate": "2019-02-31",
                    "lastDate": "2019-05-02"
                }
            )
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('array');
                done();
            })
    });
});

