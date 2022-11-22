const router = require("express").Router();
const {
  createUser,
  verifyUser,
  loginUser,
  forgotPassword,
  resetPassword,
  isValidResetTokenStatus,
  resendEmailVerification,
} = require("../controllers/authController");
const { isAuth } = require("../middleware/isAuth");
const { isValidResetToken } = require("../middleware/user");
const {
  userValidator,
  validate,
  signInValidator,
  validatePassword,
} = require("../middleware/validator");

router.post("/create", userValidator, validate, createUser);

router.post("/verify-user", verifyUser);

router.post("/sign-in", signInValidator, validate, loginUser);

router.post("/forgot-password", forgotPassword);

router.post(
  "/verify-password-reset-token",
  isValidResetToken,
  isValidResetTokenStatus
);

router.post(
  "/reset-password",
  //   validatePassword,
  //   validate,
  isValidResetToken,
  resetPassword
);

router.post("/resend-email-verification-token", resendEmailVerification);

router.get("/is-Auth", isAuth, (req, res) => {
  const { user } = req;
  res.json({
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      isVerified: user.isVerified,
      role: user.role,
    },
  });
});

module.exports = router;
