const { StatusCodes } = require("http-status-codes");
const CustomAPI = require("./custom-api");

class UnAuthorizedError extends CustomAPI {
  constructor(message) {
    super(message);
    this.statusCode = StatusCodes.UNAUTHORIZED;
  }
}

module.exports = UnAuthorizedError;
