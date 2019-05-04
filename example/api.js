/*
 * Copyright (c) 2018. Brightley Developed -- www.brightleydeveloped.com
 */

const {API} = require('bookshelf-rest-api');
const User = require('./models/user');

module.exports = function(app) {
	const api = new API(app, { baseUrl: '/api/v1' });
	/*
			REST Api builder
			will now create all these
	 */
	api.addModel(User);
};
