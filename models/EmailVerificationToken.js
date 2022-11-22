const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const EmailVerificationTokenSchema = mongoose.Schema({
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

EmailVerificationTokenSchema.pre("save", async function () {
  if (this.isModified("token")) {
    this.token = await bcrypt.hash(this.token, 10);
  }
});

EmailVerificationTokenSchema.methods.compareToken = async function (token) {
  const result = await bcrypt.compare(token, this.token);
  return result;
};
module.exports = mongoose.model(
  "EmailVerificationToken",
  EmailVerificationTokenSchema
);
