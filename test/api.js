// const API = require('../example/api');
const API = require('../');
const app = require('../example/app');
const request = require('supertest');
const User = require('../example/models/user');
const should = require('should');

const TEST_NAME = 'TEST';
const NEW_TEST_NAME = 'NEW_TEST';

const cleanUpUser = async function() {
  const user = new User();
  user.set('name', TEST_NAME);
  await user.fetch();
  if(!user.isNew()) {
	  await user.destroy();
  }
}

const cleanUpModels = async() => {
  const collection = User.collection();

  collection.query((qb) => {
    qb.where('name', '=', TEST_NAME);
    qb.orWhere('name', '=', NEW_TEST_NAME);
  });

  await collection.fetch();
  await collection.map(async(model) => {
    await model.destroy();
  });
};


describe('API functions', function() {
  let result;
  let newId;

  const api = new API(app, {
    baseUrl: "",
    hardDelete: true,
    idAttribute: 'uuid',
    visibleKey: 'is_active',
    userIdKey: 'user',
  });

  api.addModel(User);

  before(async () => {
    await cleanUpUser();
  });

  after(async () => {
    // clean up emails already added
    await cleanUpUser();
    await cleanUpModels();
  });

  it("should create an object", (done) => {
    request(app)
      .post('/user')
      .send({
        name: TEST_NAME
      })
      .expect('Content-Type', /json/)
      .expect(200)
      .end((error, res) => {
        if(error) throw error;

        res.body.data[0].id.should.be.ok;
        newId = res.body.data[0].id;
        done();
      })
  });


  it("should find an object", (done) => {
    request(app)
      .get('/user/' + newId)
      .expect('Content-Type', /json/)
      .expect(200)
      .end((error, res) => {
        if(error) throw error;

        res.body.data[0].id.should.be.ok;
        res.body.data[0].id.should.equal(newId);
        res.body.data[0].name.should.equal(TEST_NAME);

        done();
      })
  });

  it("should update an object", (done) => {
    request(app)
      .put('/user/' + newId)
      .send({
        name: NEW_TEST_NAME
      })
      .expect('Content-Type', /json/)
      .expect(200)
      .end((error, res) => {
        if(error) throw error;

        res.body.data[0].id.should.be.ok;
        res.body.data[0].id.should.equal(newId);
        res.body.data[0].name.should.equal(NEW_TEST_NAME);

        done();
      })
  });


  it("should find objects", (done) => {
    request(app)
      .get('/user/?sort=created&order=DESC&query={"name":["' + NEW_TEST_NAME + '"]}')
      .expect('Content-Type', /json/)
      .expect(200)
      .end((error, res) => {
        if(error) throw error;

        res.body.data[0].id.should.be.ok;
        res.body.data[0].id.should.equal(newId);
        res.body.data[0].name.should.equal(NEW_TEST_NAME);

        done();
      })
  });

  it("should delete an object", (done) => {
    request(app)
      .del('/user/' + newId)
      .expect('Content-Type', /json/)
      .expect(200)
      .end((error, res) => {
        if(error) throw error;

        request(app)
          .get('/user/?sort=created&order=DESC')
          .expect('Content-Type', /json/)
          .expect(200)
          .end((error, res) => {
            if(error) throw error;

            done();
          });
      })
  })
});
