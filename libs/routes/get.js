const { handleSuccess, handleError } = require('../utils/handlers');

module.exports = function(Model, options, modelOptions) {
  const {
    identifier,
    hardDelete,
    visibleKey,
    idAttribute,
    withRelated,
    withCounts,
	  requireUser
  } = {
    ...options,
    ...modelOptions
  };

  const getRoute = function (req, res, next) {
    if (requireUser && !req.user) {
      return handleError(res, {code: 403, message: 'Not authenticated.'})
    }

    const model = new Model();
    model.set(idAttribute, req.params[identifier]);

    if (!hardDelete && !req.query.all) {
      model.query(function (qb) {
        qb.where(visibleKey, '=', 1);
      });
    }

    if(withCounts && withCounts.length) {
      withCounts.forEach((withCount) => {
        model.withCount(withCount);
      })
    }

    return model.fetch({
      require: true,
      withRelated
    })
      .then(function (model) {
        // console.log("MODEL IS ACTIVE : ", model.get('uuid'));
        handleSuccess(res, {
          data: [model.toJSON()]
        });
      })
      .catch((error) => {
        handleError(res, { code: 404, message: "Resource not found."});
      });
  };

  return getRoute;
}
