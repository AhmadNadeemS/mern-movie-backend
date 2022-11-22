const { StatusCodes } = require("http-status-codes");

const errorHandlerMiddleware = (err, req, res, next) => {
  console.log(err.message);
  const defaultError = {
    statusCode: err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
    msg: err.message || "Internal server error",
  };

  res.status(defaultError.statusCode).json({ msg: defaultError.msg });
};

module.exports = errorHandlerMiddleware;
