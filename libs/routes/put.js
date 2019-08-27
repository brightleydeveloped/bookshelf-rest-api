const { handleSuccess, handleError } = require('../utils/handlers');

module.exports = function(Model, options, modelOptions) {
  const {
    idAttribute,
    identifier,
	  requireUser
  } = {
    ...options,
    ...modelOptions
  };

  const putRoute = function (req, res, next) {
    if (requireUser && !req.user) {
      handleError(res, {code: 403, message: 'Not authenticated.'})
    }

    const model = new Model();
    // console.log("id", req.params[identifier]);
    model.set(idAttribute, req.params[identifier]);
    model.fetch({require: true})
      .then(function () {
        model.setFromRequest(req.body);
        return model.save();
      })
      .then(function () {
        handleSuccess(res, {
          data: [model.toJSON()]
        });
      })
      .catch(function (error) {
        console.log("Error: ", error);
        handleError(res, { message: error.message });
      });
  };

  return putRoute;
}
