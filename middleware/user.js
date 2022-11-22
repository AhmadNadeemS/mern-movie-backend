const { isValidObjectId } = require("mongoose");
const { BadRequestError } = require("../errors");
const ForgotPasswordToken = require("../models/ForgotPasswordToken");
const User = require("../models/User");

exports.isValidResetToken = async (req, res, next) => {
  const { token, userId } = req.body;
  if (!isValidObjectId(userId)) {
    throw new BadRequestError("User Invalid!");
  }
  const userExists = await User.findById(userId);
  if (!userExists) {
    throw new BadRequestError("User not found");
  }
  const tokenExists = await ForgotPasswordToken.findOne({ owner: userId });
  if (!tokenExists) {
    throw new BadRequestError("Token not found");
  }
  const isMatched = await tokenExists.compareToken(token);
  if (!isMatched) {
    throw new BadRequestError("Invalid Token");
  }
  req.tokenExists = tokenExists;
  next();
};
