const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: "drk54otb5",
  api_key: "159728119663654",
  api_secret: "rue-H7jGvIsA3taD2EdzQDcOXjg",
  secure: true,
});

module.exports = cloudinary;
