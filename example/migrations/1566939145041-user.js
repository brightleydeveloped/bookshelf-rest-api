'use strict'
const tableName = 'user';

var config = require('../config');
var knex = require('knex')({
	client: 'pg',
	connection: config.database.postgres
});


exports.up = function(next) {
	knex.schema.createTable(tableName, function(table) {
		table.uuid("id").primary();
		table.text('name');
		table.text('first_name');
		table.text('last_name');
		table.text('email').index();
		table.text('hash');
		table.boolean('active').defaultTo(true);
		table.jsonb('data');
		table.unique('email');
		table.datetime('created');
		table.datetime('updated');
	}).then(function() {
		next();
	})
  .caught(function(error) {
    console.error(error.message);
    next(error);
    //next();
  });
};

exports.down = function(next) {
	return knex.schema.dropTable(tableName)
			.then(function() {
				next();
			})
			.caught(function(error) {
				console.error(error.message);
				next();
			});
};
