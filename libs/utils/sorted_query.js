module.exports = function(req) {
    var order = req.query.order || "DESC";
    var sort = req.query.sort;

    return function(qb) {
        if(sort) {
            qb.orderBy(sort, order);
        }
    };
};