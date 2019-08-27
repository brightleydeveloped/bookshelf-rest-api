const { handleSuccess, handleError } = require('../utils/handlers');

module.exports = function(Model, options, modelOptions) {
  const {
    hardDelete,
    visibleKey,
    idAttribute,
	  requireUser
  } = {
    ...options,
    ...modelOptions
  };

  const deleteRoute = function (req, res, next) {
    if (requireUser && !req.user) {
      return handleError(res, {code: 403, message: 'Not authenticated.'})
    }

    const model = new Model();
    model.set(idAttribute, req.params.id);
    model.fetch({require: true})
      .then(function () {
        if(model.get('uuid')) {
          model.idAttribute = 'uuid';
          model.id = model.get('uuid');
        }
        return hardDelete ? model.destroy() :
          model.set(visibleKey, 0) && model.save();
      })
      .then(function () {
        handleSuccess(res, {})
      })
      .catch((error) => {
        handleError(res, error);
      });
  };

  return deleteRoute;
}
