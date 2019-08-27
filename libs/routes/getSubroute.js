const { handleSuccess, handleError } = require('../utils/handlers');

module.exports = function(subroute, options) {
  const {
    idAttribute,
    withCounts,
	  requireUser
  } = {
    ...options,
    ...subroute
  };

  const getSubroute = function(req, res, next) {
    if(requireUser && !req.user) {
      return handleError(res, { message: STRINGS.PERMISSION_DENIED });
    }
    const model = new subroute.Model();
    model.set(idAttribute, req.params.subId);

    if(withCounts && withCounts.length) {
      withCounts.forEach((withCount) => {
        model.withCount(withCount);
      })
    }

    model.fetch()
      .then(function (model) {
        handleSuccess(res, {
          data: [model]
        });
      })
      .catch((error) => {
        handleError(res, { message: error.code === 'ER_BAD_FIELD_ERROR' ? strings.BAD_FIELD: error.message });
      })
  }

  return getSubroute;
}
