const buildSortedQuery = require('../utils/sorted_query');
const buildSearchQuery = require('../utils/search_query');
const { handleSuccess, handleError } = require('../utils/handlers');
const strings = require('../strings/en.json');

module.exports = function(Model, options, modelOptions) {
  const {
    saveUserId,
    hardDelete,
    visibleKey,
    userIdKey,
    withRelated,
    withCounts,
	  modifyRequestBeforeSearch,
	  requireUser
  } = {
    ...options,
    ...modelOptions
  };

  const getAllRoute = async function (req, res, next) {
    if (requireUser && !req.user) {
      handleError(res, {code: 403, message: strings.PERMISSION_DENIED })
      return;
    }

    const model = new Model();
    if (req.query.query) {
      try {
        let request_query = JSON.parse(req.query.query);

	      if(modifyRequestBeforeSearch) {
		      request_query = await modifyRequestBeforeSearch(req, request_query, model);
	      }

        for(const key in request_query) {
          const asArray = Array.isArray(request_query[key]) ? request_query[key]: [request_query[key]];
	        model.query((qb) => qb.whereIn(key, asArray));
        }

      } catch (e) {
        console.log("Unreadable query", req.query.query);
      }
    }

    if (!hardDelete && !req.query.all) {
      model.query('where', visibleKey, '=', 1);
    }

    if (saveUserId && req.query.user_id) {
      model.query('where', userIdKey, '=', req.query.user_id);
    } // must also search where client or project id is matching this one

    model.query(buildSortedQuery(req));
    buildSearchQuery.fromReq(req, model);

    if(withCounts && withCounts.length) {
      withCounts.forEach((withCount) => {
        model.withCount(withCount);
      })
    }

    model.fetchPage({
      page: parseInt(req.query.page, 10) || 1,
      pageSize: parseInt(req.query.limit, 10) || 10,
      withRelated
    })
      .then(function (collection) {
        handleSuccess(res, {
          data: collection,
          pagination: collection.pagination
        });
      })
      .catch((error) => {
        handleError(res, { message: error.code === 'ER_BAD_FIELD_ERROR' ? strings.BAD_FIELD: error.message });
      })
  };

  return getAllRoute;
}
