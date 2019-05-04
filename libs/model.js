const uuid = require('uuid');
const _ = require('underscore');

const Model = {
    editable_fields: [],
    public_fields: [],
    private_fields: [],
    json_array_columns: [],
    search_field: '',
    permissions_by_role: function () {
        return {
            // licensee: 'manage',
            // project_manager: 'manage',
            // proctor: 'view'
        }
    },

    initialize: function () {
        this.on('creating', this.beforeCreate.bind(this));
        this.on('saving', this.beforeSave.bind(this));
        this.on('updating', this.beforeUpdate.bind(this));

        this.on('created', this.afterCreate.bind(this));
        this.on('saved', this.afterSave.bind(this));
        this.on('updated', this.afterUpdate.bind(this));

        this.on('fetching', this.beforeFetch.bind(this));
        this.on('fetched', this.afterFetch.bind(this));
    },

    setFromRequest: function (body) {
        body = body || {};
        var self = this;
        // const data = this.get('data') || {};
        this.editable_fields.forEach(function (field) {
            if (body[field]) {
                self.set(field, body[field])
            } else if (body[field] === null) {
                self.unset(field);
            }
        });

        // this.set('data', data);

        return this;
    },

    beforeCreate: function () {
        if (!this.get('id')) {
            this.set('id', uuid.v4());
        }

        console.log("Creating: " + this.tableName + " with id " + this.id);

        this.set('created_at', new Date());
        this.set('updated_at', new Date());
    },

    beforeUpdate: function () {
        console.log("Updating: " + this.tableName + " " + this.id);
        // console.log("Changed: ", this.changed);

        this.set('updated_at', new Date());
    },

    beforeSave: function () {
        this.json_array_columns.forEach((column) => {
            if (this.get(column) && _.isArray(this.get(column))) {
                this.set(column, JSON.stringify(this.get(column)));
            }
        });
    },

    beforeFetch: function () {

    },

    beforeFetchCollection: function (req, res) {

    },

    afterCreate: function () {

    },

    afterSave: function () {
    },

    afterUpdate: function () {

    },

    afterFetch: function () {
    },

    convertJSONArrays(data) {
        this.json_array_columns.forEach(function (column) {
            if (data[column] && _.isString(data[column])) {
                data[column] = JSON.parse(data[column]);
            }
        });
        return data
    },

    private: function () {
        const data = this.serialize();
        this.convertJSONArrays(data);
        const o = _.pick(data, this.private_fields);
        Object.assign(o, this.public());
        Object.keys(o).forEach(function (k) {
            if (o[k] === null || o[k] === undefined) {
                delete o[k];
            }
        });
        return o;
    },
    public: function () {
        const data = this.serialize();
        this.convertJSONArrays(data);
        const o = _.pick(data, this.public_fields);
        Object.keys(o).forEach(function (k) {
            if (o[k] === null || o[k] === undefined) {
                delete o[k];
            }
        });
        return o;
    },

    toJSON: function () {
        return this.public();
    },

    permittedRoles(role, action) {
        console.log("Permissions by role: ", role)
        if (!role) {
            return false;
        }
        const permissions = this.permissions_by_role();
        const permission = permissions[role];

        // console.log("Permissions by action: ", action)
        if (permission) {
            if (permission === 'manage') {
                return true;
            }

            if (permission === 'view' && action === 'view') {
                return true;
            }
            return false;
        }

        return true;
    },

    // determines if a user has access to a model
    hasPermissionTo: function (action, user) {
        if (!user) {
            return false;
        }

        if (user.isAdmin()) {
            return true;
        }


        // if the user has permitted roles for this model
        // if (user.permittedRoles(user.roleFor(this), action)) {
        //     return true;
        // }

        if (this.id === user.id || user.id === this.get('user_id')) {
            return true;
        }

        return false;
    },

    updatePermissions: function (user, role) {
        // nothing for the basic model
    }

};

module.exports = Model;