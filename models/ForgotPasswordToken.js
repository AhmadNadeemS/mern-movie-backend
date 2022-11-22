const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const ForgotPasswordTokenSchema = mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  token: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    expires: 3600,
    default: Date.now(),
  },
});

ForgotPasswordTokenSchema.pre("save", async function () {
  if (this.isModified("token")) {
    this.token = await bcrypt.hash(this.token, 10);
  }
});

ForgotPasswordTokenSchema.methods.compareToken = async function (token) {
  const result = await bcrypt.compare(token, this.token);
  return result;
};
module.exports = mongoose.model(
  "ForgotPasswordToken",
  ForgotPasswordTokenSchema
);
