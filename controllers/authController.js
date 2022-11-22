const nodemailer = require("nodemailer");
const { StatusCodes } = require("http-status-codes");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { BadRequestError } = require("../errors");
const EmailVerificationToken = require("../models/EmailVerificationToken");
const { isValidObjectId } = require("mongoose");
const { generateRandomByte } = require("../utils/helper");
const ForgotPasswordToken = require("../models/ForgotPasswordToken");

exports.createUser = async (req, res) => {
  const { name, email, password } = req.body;
  const userExists = await User.findOne({ email });
  if (userExists) {
    throw new BadRequestError("User already exists");
  }
  const newUser = new User({ name, email, password });
  await newUser.save();

  let OTP = "";
  for (let i = 0; i < 6; i++) {
    const randomValue = Math.round(Math.random() * 9);
    OTP += randomValue;
  }
  const emailVerificationToken = new EmailVerificationToken({
    owner: newUser._id,
    token: OTP,
  });
  await emailVerificationToken.save();
  var transport = nodemailer.createTransport({
    host: "smtp.mailtrap.io",
    port: 2525,
    auth: {
      user: process.env.MAIL_TRAP_USER,
      pass: process.env.MAIL_TRAP_PASS,
    },
  });
  transport.sendMail({
    from: "movie@example.com>",
    to: newUser.email,
    subject: "Email Verification",
    html: `<p>Your verification OTP</p>
                <h1>${OTP}</h1>`,
  });
  res.status(StatusCodes.CREATED).json({
    user: {
      id: newUser._id,
      name: newUser.name,
      email: newUser.email,
    },
  });
};

exports.resendEmailVerification = async (req, res) => {
  const { userId } = req.body;

  if (!isValidObjectId(userId)) throw new BadRequestError("User Invalid!");
  const userExists = await User.findById(userId);
  if (!userExists) {
    throw new BadRequestError("User not found!");
  }
  if (userExists.isVerified) {
    throw new BadRequestError("User already verified!");
  }
  const tokenExists = await EmailVerificationToken.findOne({
    owner: userId,
  });
  if (tokenExists) {
    throw new BadRequestError("wait for an hour");
  }
  let OTP = "";
  for (let i = 0; i < 6; i++) {
    const randomValue = Math.round(Math.random() * 9);
    OTP += randomValue;
  }
  const emailVerificationToken = new EmailVerificationToken({
    owner: userExists._id,
    token: OTP,
  });
  await emailVerificationToken.save();
  var transport = nodemailer.createTransport({
    host: "smtp.mailtrap.io",
    port: 2525,
    auth: {
      user: process.env.MAIL_TRAP_USER,
      pass: process.env.MAIL_TRAP_PASS,
    },
  });
  transport.sendMail({
    from: "movie@example.com>",
    to: userExists.email,
    subject: "Email Verification",
    html: `<p>Your verification OTP</p>
                <h1>${OTP}</h1>`,
  });
  res.status(StatusCodes.CREATED).json({
    user: {
      id: userExists._id,
      name: userExists.name,
      email: userExists.email,
    },
    message: "OTP emailed",
  });
};

exports.verifyUser = async (req, res) => {
  const { userId, OTP } = req.body;
  if (!isValidObjectId(userId)) throw new BadRequestError("User Invalid!");
  const userExists = await User.findById(userId);
  if (!userExists) {
    throw new BadRequestError("User not found!");
  }
  if (userExists.isVerified) {
    throw new BadRequestError("User already verified!");
  }
  const tokenExists = await EmailVerificationToken.findOne({
    owner: userId,
  });
  if (!tokenExists) {
    throw new BadRequestError("Token not found!");
  }
  const isValidToken = await tokenExists.compareToken(OTP);
  if (!isValidToken) {
    throw new BadRequestError("Invalid found!");
  }
  userExists.isVerified = true;
  await userExists.save();
  await EmailVerificationToken.findByIdAndDelete(tokenExists._id);
  const jwtToken = await jwt.sign({ userId: userExists._id }, "Secret");

  res.status(StatusCodes.CREATED).json({
    user: {
      id: userExists._id,
      name: userExists.name,
      email: userExists.email,
      isVerified: userExists.isVerified,
      role: userExists.role,
    },
    token: jwtToken,
    message: "User is verified",
  });
  console.log(userExists);
};

exports.loginUser = async (req, res) => {
  const { email, password } = req.body;
  const userExists = await User.findOne({ email });
  if (!userExists) {
    throw new BadRequestError("User not found!");
  }

  const isValid = await userExists.comparePassword(password);

  if (!isValid) {
    throw new BadRequestError("Invalid Password");
  }

  const jwtToken = await jwt.sign({ userId: userExists._id }, "Secret");

  res.status(StatusCodes.CREATED).json({
    user: {
      id: userExists._id,
      name: userExists.name,
      email: userExists.email,
      isVerified: userExists.isVerified,
      role: userExists.role,
    },
    token: jwtToken,
    message: "User is verified",
  });
};

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  console.log(email);
  const users = await User.find({});
  console.log(users);
  const userExists = await User.findOne({ email });
  if (!userExists) {
    throw new BadRequestError("User not found!");
  }
  const tokenExists = await ForgotPasswordToken.findOne({
    owner: userExists._id,
  });
  if (tokenExists) {
    throw new BadRequestError(
      "Only after one hour you can request for another token!"
    );
  }

  let OTP = await generateRandomByte();
  const forgotPasswordToken = new ForgotPasswordToken({
    owner: userExists._id,
    token: OTP,
  });
  await forgotPasswordToken.save();

  let resetPasswordUrl = `http://localhost:3001/auth/reset-password?token=${OTP}&userId=${userExists._id}`;

  var transport = nodemailer.createTransport({
    host: "smtp.mailtrap.io",
    port: 2525,
    auth: {
      user: process.env.MAIL_TRAP_USER,
      pass: process.env.MAIL_TRAP_PASS,
    },
  });

  transport.sendMail({
    from: "movie@example.com>",
    to: email,
    subject: "Reset Password Link",
    html: `<p>Click here to reset password</p>
                <a href='${resetPasswordUrl}'>Change Password</a>`,
  });

  res.json({ message: "Link sent to your email!" });
};

exports.resetPassword = async (req, res) => {
  const { newPassword, userId } = req.body;
  console.log("'called");
  const userExists = await User.findById(userId);
  if (!userExists) {
    throw new BadRequestError("User not found!");
  }
  const isMatched = await userExists.comparePassword(newPassword);
  if (isMatched) throw new BadRequestError("Password must be different!");
  userExists.password = newPassword;
  await userExists.save();
  console.log("id" + req.tokenExists._id);
  await ForgotPasswordToken.findByIdAndDelete(req.tokenExists._id);

  res.json({ message: "Password has been changed" });
};

exports.isValidResetTokenStatus = (req, res) => {
  res.json({ valid: true });
};
