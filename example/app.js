var express = require('express');
const bodyParser = require('body-parser');
var app = express();
app.use(bodyParser.json());
require('./api')(app);
module.exports = app;
