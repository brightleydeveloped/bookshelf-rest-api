const API = require('./libs/api');
const Model = require('./libs/model');
// circular for backwards compatibility
API.API = API;
API.Model = Model;

module.exports = API;
