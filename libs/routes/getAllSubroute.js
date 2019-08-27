const buildSortedQuery = require('../utils/sorted_query');
const buildSearchQuery = require('../utils/search_query');
const {handleSuccess, handleError} = require('../utils/handlers');
const strings = require('../strings/en.json');

module.exports = function (subroute, options) {
  const {
    identifier,
    saveUserId,
    hardDelete,
    visibleKey,
    userIdKey,
    withRelated,
    withCounts,
    afterFetch,
    modifyRequestBeforeSearch,
	  requireUser
  } = {
    ...options,
    ...subroute
  };


  const getAllSubroute = async function (req, res, next) {
    if (requireUser && !req.user) {
      return handleError(res, {code: 403, message: strings.PERMISSION_DENIED});
    }

    const model = new subroute.Model;

    if (req.query.query) {
      try {
        let request_query = JSON.parse(req.query.query);
        if(modifyRequestBeforeSearch) {
          request_query = await modifyRequestBeforeSearch(req, request_query, model);
        }

        model.where(request_query);
      } catch (e) {
        console.log("Unreadable query", req.query.query, e);
      }
    }

    if (!hardDelete && !req.query.all) {
      model.query('where', visibleKey, '=', 1);
    }

    if (saveUserId && req.query.user_id) {
      model.query('where', userIdKey, '=', req.query.user_id);
    } // must also search where client or project id is matching this one

    model.query(buildSortedQuery(req));

    model.query((qb) => {
      qb.where(subroute.target, req.params[identifier]);

      buildSearchQuery.searchQuery(qb, buildSearchQuery.gatherFields(model), buildSearchQuery.getSearch(req));
    });

    return model.fetchPage({
      page: parseInt(req.query.page, 10) || 0,
      pageSize: parseInt(req.query.limit, 10) || 10,
      withRelated
    })
      .then(function (collection) {
        const promises = [];

        collection.map((model) => {
          const newModel = new subroute.Model({
            uuid: model.get('uuid')
          })

          if (withCounts && withCounts.length) {
            withCounts.forEach((withCount) => {
              promises.push(newModel.related(withCount)
                .count()
                .then((counts) => {
                  model.set(withCount + 'Count', counts);
                  return counts;
                }));
            })

          }
        });

        return Promise.all(promises)
          .then(() => {
            const promises = [];
            if(afterFetch) {
              afterFetch.forEach((fn) => {
                promises.push(fn(collection));
              })
            }
            return Promise.all(promises);
          })
          .then((results) => {
            return collection;
          });
      })
      .then((collection) => {
        handleSuccess(res, {
          data: collection,
          pagination: collection.pagination
        });
      })
      .catch((error) => {
        console.log("Error: ", error);
        handleError(res, {message: error.code === 'ER_BAD_FIELD_ERROR' ? strings.BAD_FIELD : error.message});
      });
  }

  return getAllSubroute;
}
