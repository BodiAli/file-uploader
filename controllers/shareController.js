const asyncHandler = require("express-async-handler");
const prisma = require("../prisma/prismaClient");

exports.getSharePage = asyncHandler(async (req, res) => {
  const folders = await prisma.folder.findMany({
    where: {
      shared: true,
    },
    omit: {
      createdAt: true,
      updatedAt: true,
    },
  });

  console.log(folders);

  res.render("share", { folders });
});
