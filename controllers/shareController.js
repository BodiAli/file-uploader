const asyncHandler = require("express-async-handler");
const { v4: uuidv4 } = require("uuid");
const prisma = require("../prisma/prismaClient");
const NotFoundError = require("../errors/customNotFoundError");
const GoneError = require("../errors/customGoneError");

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
    orderBy: {
      name: "asc",
    },
  });
  console.log("shared folders", sharedFolders);

  res.render("share", { sharedFolders, folders });
});

exports.getSharedFolder = asyncHandler(async (req, res) => {
  const { token } = req.params;

  const sharedFolder = await prisma.folder.findUnique({
    where: {
      shareToken: token,
    },
    include: {
      files: true,
    },
  });

  if (!sharedFolder) {
    throw new NotFoundError("Invalid share link");
  }

  if (sharedFolder.expiresAt < new Date()) {
    throw new GoneError("This shared link has expired.");
  }

  console.log(sharedFolder);

  res.render("shared-folder", { sharedFolder });
});

exports.createSharedFolder = [
  asyncHandler(async (req, res) => {
    const { folders: foldersId, duration } = req.body;

    const durationHours = Number(duration);
    const durationMs = durationHours * 60 * 60 * 1000;
    const expiresAt = new Date(Date.now() + durationMs);

    console.log("foldersId body", foldersId);

    if (Array.isArray(foldersId)) {
      foldersId.forEach(async (id) => {
        await prisma.folder.update({
          where: {
            id: Number(id),
          },
          data: {
            shared: true,
            shareToken: uuidv4(),
            shareExpires: expiresAt,
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
          shareToken: uuidv4(),
          shareExpires: expiresAt,
        },
      });
    }

    const referrer = req.header("referrer") || "/share";

    res.redirect(referrer);
  }),
];
