const jwt = require("jsonwebtoken");

const { BadRequestError } = require("../errors");
const User = require("../models/User");

exports.isAuth = async (req, res, next) => {
  const token = req.headers?.authorization;
  if (!token) {
    throw new BadRequestError("Invalid Token");
  }
  const jwtToken = token.split(" ")[1];
  const decode = await jwt.verify(jwtToken, "Secret");
  const { userId } = decode;
  const user = await User.findById(userId);
  if (!user) {
    throw new BadRequestError("Invalid User");
  }
  req.user = user;
  next();
};

exports.isAdmin = async (req, res, next) => {
  const { user } = req;
  if (user.role !== "admin") throw new BadRequestError("unAuthorized");
  next();
};
