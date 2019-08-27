const searchQuery = function(qb, search_fields, search) {
  if(search) {
    if(search_fields.length > 0) {
      qb.andWhere(function () {
        const qb = this;
        search_fields.forEach((field) => {
          console.log("Search and field: ", field);
          qb.orWhereRaw(`LOWER(${field}) LIKE ?`, '%' + search + '%');
        });
      });
    }
  }
}

const gatherFields = function(model) {
  const search_fields = model.search_fields || [];
  if(model.search_field) {
    search_fields.push(model.search_field);
  }
  return search_fields
}

const getSearch = function(req) {
  return (req.query.search || '').toLowerCase() || '';
}

module.exports = {
  fromReq: function(req, model) {
    let search = getSearch(req);
    if (search) {
      model.query((qb) => {
        const search_fields = gatherFields(model);
        searchQuery(qb, search_fields, search);
      });
    }
  },
  gatherFields,
  searchQuery,
  getSearch
}