module.exports = function(req) {
    return req.query && req.query.load ? JSON.parse(req.query.load): undefined;
};