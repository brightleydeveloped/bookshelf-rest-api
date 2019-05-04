module.exports = function(req) {
    var limit = req.query.limit || 50;
    var order = req.query.order || "DESC";
    var offset = req.query.offset || 0;
    var sort = req.query.sort;

    return function(qb) {
        if(sort) {
            qb.orderBy(sort, order);
        }
        qb.limit(limit);
        qb.offset(offset);
    };
};