const { handleSuccess, handleError } = require('../utils/handlers');

module.exports = function(Model, options, modelOptions) {
  const {
    saveUserId,
    userIdKey,
	  requireUser
  } = {
    ...options,
    ...modelOptions
  };

  const postRoute = function (req, res, next) {
    if (requireUser && !req.user) {
      return handleError(res, {code: 403, message: 'Not authenticated.'});
    }

    const model = new Model();

    if(saveUserId) {
      model.set(userIdKey, req.user[idAttribute]);
    }

    const createOrUpdateModel = function () {
      model.setFromRequest(req.body);

      return model.save()
        .then(function () {
          const json = req.query.succinct && model.toSuccinct ? model.toSuccinct() : model.toJSON();
          handleSuccess(res, {
            data: [json]
          })
        })
        .catch(function (error) {
          console.log("Error: ", error);
          handleError(res, error);
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
          if (exists) {
            handleSuccess(res, {
              data: [exists.public()]
            });
          } else {
            createOrUpdateModel();
          }
        })
    } else {
      return createOrUpdateModel();
    }
  }

  return postRoute;
}
