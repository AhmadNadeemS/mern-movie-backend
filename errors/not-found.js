const { StatusCodes } = require("http-status-codes");
const CustomAPI = require("./custom-api");

class NotFoundError extends CustomAPI {
  constructor(message) {
    super(message);
    this.statusCode = StatusCodes.NOT_FOUND;
  }
}

module.exports = NotFoundError;
