const { check, validationResult } = require("express-validator");

exports.userValidator = [
  check("name").trim().not().isEmpty().withMessage("Name is missing!"),
  check("email").normalizeEmail().isEmail().withMessage("Email is invalid!"),
  check("password")
    .trim()
    .not()
    .isEmpty()
    .withMessage("Password is missing!")
    .isLength({ min: 8, max: 20 })
    .withMessage("Password must be 8 to 20 characters long!"),
];

exports.signInValidator = [
  check("email").normalizeEmail().isEmail().withMessage("Email is invalid!"),
  check("password").trim().not().isEmpty().withMessage("Password is missing!"),
  // .isLength({ min: 8, max: 20 })
  // .withMessage("Password must be 8 to 20 characters long!"),
];

exports.validatorActor = [
  check("name").trim().not().isEmpty().withMessage("Name is missing!"),
  check("gender").trim().not().isEmpty().withMessage("gender is missing!"),
  check("about").trim().not().isEmpty().withMessage("about is missing!"),
];

exports.validatePassword = [
  check("newPassword")
    .trim()
    .not()
    .isEmpty()
    .withMessage("Password is missing!")
    .isLength({ min: 8, max: 20 })
    .withMessage("Password must be 8 to 20 characters long!"),
];

exports.validateRatings = check(
  "rating",
  "rating must be between 0 and 10."
).isFloat({ min: 0, max: 10 });

exports.validate = (req, res, next) => {
  const error = validationResult(req).array();
  if (error.length) {
    return res.json({ error: error[0].msg });
  }
  next();
};
