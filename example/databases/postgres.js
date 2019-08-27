const Bookshelf = require('bookshelf');
const config = require('../config');
const bookshelfEloquent = require('bookshelf-eloquent');
const Model = require('../../libs/model');

const knex = require('knex')({
    client: 'pg',
    connection: config.database.postgres,
    pool: {
        max: 5,
        min: 0
    },
    debug: process.env.DEBUG_DATABASE
});

var bookshelf = Bookshelf(knex);

// bookshelf.plugin('pagination');

bookshelf.Model = bookshelf.Model.extend(Model);

bookshelf.plugin("pagination");
bookshelf.plugin(bookshelfEloquent);

module.exports = bookshelf;
