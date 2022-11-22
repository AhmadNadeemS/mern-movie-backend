const { StatusCodes } = require("http-status-codes");
const CustomAPI = require("./custom-api");

class BadRequestError extends CustomAPI {
  constructor(message) {
    super(message);
    this.statusCode = StatusCodes.BAD_REQUEST;
  }
}

module.exports = BadRequestError;
