const _ = require('underscore');
const Bookshelf = require('../databases/postgres');

var User = Bookshelf.Model.extend({
    tableName: 'user',
    editable_fields: ['email', 'name', 'first_name', 'last_name', 'password'],
    private_fields: ['token', 'created_at', 'updated_at'],
    public_fields: ['id', 'email', 'name', 'role'],
    unique_fields: ['email'],
    validation: function() {
        return {
            email: {
                required: true,
                pattern: /^[-a-z0-9~!$%^&*_=+}{\'?]+(\.[-a-z0-9~!$%^&*_=+}{\'?]+)*@([a-z0-9_][-a-z0-9_]*(\.[-a-z0-9_]+)*\.(aero|arpa|biz|com|coop|edu|gov|info|int|mil|museum|name|net|org|pro|travel|mobi|[a-z][a-z])|([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))(:[0-9]{1,5})?$/i
            },
            password: {
                required: true
            }
        }
    },
});

module.exports = User;
