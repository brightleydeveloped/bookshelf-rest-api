const STATUS = {
  SUCCESS: 'SUCCESS',
  ERROR: 'ERROR'
};

module.exports = {
  handleSuccess: function (res, {code = 200, message = '', data = [], pagination = null}) {
    const result = {
      status: STATUS.SUCCESS,
      data
    };

    if (message) {
      result.message = message;
    }

    if (pagination) {
      result.pagination = pagination;
    }

    if(data.pagination && !pagination) {
      result.pagination = data.pagination;
    }

    res.status(code).json(result);
  },
  handleError: function (res, {code = 406, message = ''}) {
    let _message = !process.env.production ? message : '';

    // if this is a string, it causes issues
    if(!parseInt(code)) {
      code = 500;
    }

    res.status(code).json({
      status: STATUS.ERROR,
      message: _message
    });
  }
}