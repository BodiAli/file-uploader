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

  console.log("shared folders", sharedFolders);

  res.render("share", { sharedFolders, folders });
});

exports.createSharedFolder = [
  asyncHandler(async (req, res) => {
    const { folders: foldersId } = req.body;
    console.log("foldersId body", foldersId);

    if (Array.isArray(foldersId)) {
      foldersId.forEach(async (id) => {
        await prisma.folder.update({
          where: {
            id: Number(id),
          },
          data: {
            shared: true,
          },
        });
      });
    } else {
      await prisma.folder.update({
        where: {
          id: Number(foldersId),
        },
        data: {
          shared: true,
        },
      });
    }

    const referrer = req.header("referrer") || "/share";

    res.redirect(referrer);
  }),
];
