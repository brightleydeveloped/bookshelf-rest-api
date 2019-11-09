const uuid = require('uuid');
const _ = require('underscore');

const arrayToObject = (array) =>
		array.reduce((obj, item) => {
			obj[item] = true;
			return obj
		}, {})

// a NOT NULL field is empty
const Model = {
	editable_fields: [],
	public_fields: [],
	private_fields: [],

	search_fields: [],

	json_fields: ['data'],
	json_array_columns: [],
	default_fields: {},

	required_fields: [],

	unique_fields: [],

	autoset_fields: ['id', 'created', 'updated'],

	search_field: '',

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

		this.editable_fields.forEach(function (field) {
			if (body[field]) {
				self.set(field, body[field])
			} else if (body[field] === null) {
				self.unset(field);
			}
		});

		return this;
	},

	beforeCreate: function () {
		// console.log("BEFORE CREATE");
		const autosetFields = arrayToObject(this.autoset_fields);
		//
		if (autosetFields.id && !this.get('id')) {
			this.set('id', uuid.v4());
		}

		console.log("Creating: " + this.tableName + " with id " + this.id);
		if(autosetFields.created) {
			this.set('created', new Date());
		}

		if(autosetFields.updated) {
			this.set('updated', new Date());
		}
	},

	beforeUpdate: function () {
		const autosetFields = arrayToObject(this.autoset_fields);

		if(autosetFields.updated) {
			this.set('updated', new Date());
		}
	},

	beforeSave: function () {
		if(this.default_fields) {
			if(Object.keys(this.default_fields).length) {
				for(const field in this.default_fields) {
					if(this.get(field) === undefined) {
						// console.log("setting field ", field, ' as ', this.default_fields[field]);
						this.set(field, this.default_fields[field]);
					}
				}
			}
		}

		this.json_fields.forEach((column) => {
			if(this.get(column) && _.isObject(this.get(column))) {
				this.set(column, JSON.stringify(this.get(column)));
			}
		});

		this.json_array_columns.forEach((column) => {
			if (this.get(column) && _.isArray(this.get(column))) {
				this.set(column, JSON.stringify(this.get(column)));
			}
		});

		this.required_fields.forEach((field) => {
			if(this.get(field) === undefined) {
				throw new Error(`'${field}' is required.`);
			}
		})
	},

	afterSave: function() {
		this.convertJSONFields();
	},

	beforeFetch: function () {

	},

	beforeFetchCollection: function (req, res) {

	},

	afterCreate: function () {

	},

	afterUpdate: function () {

	},

	afterFetch: function () {
		this.convertJSONArrays(this.attributes);
		this.convertJSONFields();
	},

	convertJSONFields() {
		this.json_fields.forEach((column) => {
			if(this.get(column) && _.isString(this.get(column))) {
				this.set(column, JSON.parse(this.get(column)));
			}
		});
	},

	convertJSONArrays(data) {
		this.json_fields.forEach((column) => {
			if (data[column] && _.isString(data[column])) {
				data[column] = JSON.parse(data[column]);
			}
		});

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
	}
};

module.exports = Model;
