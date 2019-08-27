const getAllRoute = require('./routes/getAll');
const getRoute = require('./routes/get');
const postRoute = require('./routes/post');
const putRoute = require('./routes/put');
const deleteRoute = require('./routes/delete');
const getAllSubroute = require('./routes/getAllSubroute');
const getSubroute = require('./routes/getSubroute');

const DEFAULTS = {
  identifier: 'id',
  baseUrl: '',
  hardDelete: false,
  idAttribute: 'id',
  visibleKey: 'active',
  userIdKey: 'user_id'
};

const DEFAULT_MODEL_OPTIONS = {
  name: '',
  saveUserId: false,
  disabledMethods: {
    // GET_ALL, GET, POST, PUT, DELETE

  },
  // array of Models
  subroutes: [],
  withRelated: []
};

class API {
  constructor(app, options = {}) {
    this.app = app;

    this.model_map = {};

    this.options = {
      ...DEFAULTS,
      ...options
    };
  }

  addModel(Model, modelOptions) {
    this.model_map[Model.prototype.tableName] = Model;

    this.setupModel(Model, modelOptions);
  }

  /**
   * Uses name as path
   * @param Model
   * @param modelOptions
   */
  setupModel(Model, _modelOptions = {  }) {
    const app = this.app;
    const options = this.options;

    const modelOptions = {
      ...DEFAULT_MODEL_OPTIONS,
      ..._modelOptions
    };

    const {
      baseUrl,
      identifier,
      disabledMethods
    } = {
      ...modelOptions,
      ...options
    };

    const name = modelOptions.name || Model.prototype.tableName;

    const path = baseUrl + '/' + name;

    if(modelOptions.subroutes.length) {
      modelOptions.subroutes.forEach((subroute) => {
        app.get(`${path}/:${identifier}/${subroute.path}`, getAllSubroute(subroute, options));
        app.get(`${path}/:${identifier}/${subroute.path}/:subId`, getSubroute(subroute, options));
      });
    }

    if(!disabledMethods.GET_ALL) {
      app.get(path, getAllRoute(Model, options, modelOptions));
    }

    if(!disabledMethods.GET) {
      app.get(path + '/:' + identifier, getRoute(Model, options, modelOptions));
    }

    if(!disabledMethods.POST) {
      app.post(path, postRoute(Model, options, modelOptions));
    }

    if(!disabledMethods.PUT) {
      app.put(path + '/:' + identifier, putRoute(Model, options, modelOptions));
    }

    if(!disabledMethods.DELETE) {
      app.delete(path + "/:" + identifier, deleteRoute(Model, options, modelOptions));
    }

  }

}

module.exports = API;
