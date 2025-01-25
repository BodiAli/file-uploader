const asyncHandler = require("express-async-handler");
const { isAuthenticated } = require("./authenticationController");

exports.getStoragePage = [
  isAuthenticated,
  asyncHandler((req, res) => {
    res.render("storage");
  }),
];
