/*
 * Copyright (c) 2018. Brightley Developed -- www.brightleydeveloped.com
 */

/**
 * @Author David Brightley
 */
const _ = require('underscore');
const ErrorHandler = require('../utils/error_handler');
const Promise = require('bluebird');

const buildSortedQuery = require('../utils/sorted_query');
const foreignRelations = require('../utils/foreign_relations');

const DEFAULTS = {
    identifier: 'id',
    baseUrl: '/',
    hardDelete: false
};

class API {
    constructor(app, options = {}) {
        this.app = app;

        this.model_map = {};

        this.options = _.defaults(options, DEFAULTS);
    }

    addModel(Model) {
        this.model_map[Model.prototype.tableName] = Model;

        this.setupModel(Model);
    }

    setupModel(Model, modelOptions = {}) {
        const app = this.app;
        const {baseUrl, identifier} = _.defaults(modelOptions, this.options);
        const hardDelete = this.options.hardDelete;
        const name = Model.prototype.tableName;
        const path = baseUrl + '/' + name;

        // console.log("api loading: ", path);

        app.get(path, function (req, res, next) {
            // if (!req.user) {
            //     throw Errors.PermissionDenied();
            // }
            const model = new Model();

            let query = {};
            if (req.query.query) {
                try {
                    let request_query = JSON.parse(req.query.query);
                    model.where(request_query);
                } catch (e) {
                    console.log("Unreadable query", req.query.query);
                }
            }

            if (req.query.search && model.search_field) {
                model.query('where', model.search_field, 'ilike', '%' + req.query.search + '%');
            }

            if (!hardDelete && !req.query.all && req.user && req.user.isAdmin()) {
                model.query('where', 'visible', '=', true);
            }

            if (req.query.user_id) {
                model.query('where', 'user_id', '=', req.query.user_id);
            } // must also search where client or project id is matching this one

            model.query(buildSortedQuery(req));

            const withRelated = foreignRelations(req);

            model.fetchPage({
                limit: req.query.limit || 100,
                offset: req.query.offset || 0
            })
                .then(function (collection) {
                    return res.status(200).json({
                        success: true,
                        results: collection.toJSON(),
                        pagination: collection.pagination
                    });
                })
                .catch(next)
        });

        app.get(path + '/:' + identifier, function (req, res, next) {
            if (!req.user) {
                throw ErrorHandler.PermissionDenied();
            }

            const model = new Model();
            model.set('id', req.params.id);
            const withRelated = foreignRelations(req);

            if (!hardDelete && !req.query.all) {
                model.query(function (qb) {
                    qb.where('visible', '=', true);
                });
            }

            // figure out permissions
            // if(model.hasPermissionTo('own', req.user)) {
            //     model.query(function(qb) {
            //         qb.knex.where('user_id', '=', req.user.id)
            //             .orWhereRaw("permissions->'user_id' = ?", [req.user.id]);
            //     });
            // }

            return model.fetch({
                require: true,
                withRelated
            })
                .then(function (model) {
                    res.status(200).json({
                        success: true,
                        results: [model.toJSON()]
                    });
                })
                .catch(next);
        });

        app.post(path, function (req, res, next) {
            if (!req.user) {
                throw ErrorHandler.PermissionDenied();
            }

            const model = new Model();

            if (req.body.resource_id && req.body.resource_type) {
                model[req.body.resource_type + '_id'] = req.body.resource_id;
                model.set(req.body.resource_type + '_id', req.body.resource_id);
            }
            // user doesn't have permission to manage this resource,
            // cannot create
            model.set('user_id', req.user.id);

            // console.log("User: ", req.user.related('roles').toJSON());
            // console.log("Model: ", req.body);
            if (!model.hasPermissionTo('manage', req.user)) {
                throw ErrorHandler.PermissionDenied();
            }

            const createOrUpdateModel = function () {
                model.setFromRequest(req.body);

                return model.save()
                    .then(function (model) {
                        const json = req.query.succinct && model.toSuccinct ? model.toSuccinct() : model.toJSON();

                        return res.status(200).json({
                            success: true,
                            results: [json]
                        });
                    })
                    .catch(function (error) {
                        if (error && error.message && /duplicate key value violates unique/.test(error.message)) {
                            error = ErrorHandler.Exists(name);
                        }

                        next(error);
                    });
            };

            if (model.unique_fields) {
                model.unique_fields.forEach(function (field) {
                    if (req.body[field]) {
                        model.set(field, req.body[field]);
                    }
                });
                return model.fetch()
                    .then(function (exists) {
                        if (exists && !model.allow_post_update) {
                            // TODO determine if user has permission to view
                            return res.status(200).json({
                                success: true,
                                results: [exists.public()]
                            });
                        } else {
                            createOrUpdateModel();
                        }

                    })

            } else {
                return createOrUpdateModel();
            }

        });

        app.put(path + '/:' + identifier, function (req, res, next) {
            if (!req.user) {
                throw ErrorHandler.PermissionDenied();
            }

            const model = new Model();
            // console.log("id", req.params[identifier]);
            model.set('id', req.params[identifier]);
            model.fetch({require: true})
                .then(function () {
                    // console.log('model', model.id);
                    if (req.user.isAdmin() || model.hasPermissionTo('manage', req.user)) {
                        model.setFromRequest(req.body);
                        return model.save();
                    } else {
                        throw ErrorHandler.PermissionDenied();
                    }
                })
                .then(function () {
                    return res.status(200).json({
                        success: true,
                        results: [model.toJSON()]
                    });
                })
                .catch(function (error) {
                    if (error && error.message && /duplicate key value violates unique/.test(error.message)) {
                        error = ErrorHandler.Exists(name);
                    }

                    next(error);
                });
        });

        app.delete(path + "/:" + identifier, function (req, res, next) {
            if (!req.user) {
                throw ErrorHandler.PermissionDenied();
            }

            const model = new Model();
            model.set('id', req.params.id);
            model.fetch({require: true})
                .then(function () {
                    if (req.user.isAdmin() || model.hasPermissionTo('manage', req.user)) {
                        return hardDelete ? model.destroy() :
                            model.set('visible', false) && model.save();
                    } else {
                        throw ErrorHandler.PermissionDenied();
                    }
                })
                .then(function () {
                    return res.status(200).json({
                        success: true
                    });
                })
                .catch(next);
        });
    }

}

module.exports = API;
