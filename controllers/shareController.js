const asyncHandler = require("express-async-handler");
const prisma = require("../prisma/prismaClient");

exports.getSharePage = asyncHandler(async (req, res) => {
  const sharedFolders = await prisma.folder.findMany({
    where: {
      shared: true,
      userId: req.user.id,
    },
    omit: {
      createdAt: true,
      updatedAt: true,
    },
  });
  const folders = await prisma.folder.findMany({
    where: {
      userId: req.user.id,
    },
  });

  console.log(sharedFolders);

  res.render("share", { sharedFolders, folders });
});
