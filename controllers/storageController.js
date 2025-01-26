const asyncHandler = require("express-async-handler");
const { formatDistanceToNow } = require("date-fns");
const { isAuthenticated } = require("./authenticationController");
const prisma = require("../prisma/prismaClient");

exports.getStoragePage = [
  isAuthenticated,
  asyncHandler(async (req, res) => {
    const result = await prisma.folder.findMany({
      where: {
        userId: req.user.id,
      },
    });

    const folders = result.map((value) => ({
      ...value,
      createdAt: formatDistanceToNow(value.createdAt, { addSuffix: true, includeSeconds: true }),
      updatedAt: formatDistanceToNow(value.updatedAt, { addSuffix: true, includeSeconds: true }),
    }));

    res.render("storage", { folders });
  }),
];

exports.createFolder = [
  asyncHandler(async (req, res) => {
    await prisma.folder.create({
      data: {
        name: req.body.folderName,
        userId: req.user.id,
      },
    });

    const referrer = req.header("referrer") || "/storage";

    res.redirect(referrer);
  }),
];
