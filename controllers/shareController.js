const asyncHandler = require("express-async-handler");

exports.getSharePage = asyncHandler(async (req, res) => {
  res.render("share");
});
