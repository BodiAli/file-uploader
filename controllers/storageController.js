const asyncHandler = require("express-async-handler");
const { formatDistanceToNow } = require("date-fns");
const { body, validationResult } = require("express-validator");
const { isAuthenticated } = require("./authenticationController");
const prisma = require("../prisma/prismaClient");

exports.getStoragePage = [
  isAuthenticated,
  asyncHandler(async (req, res) => {
    const { sortBy } = req.query;

    const result = await prisma.folder.findMany({
      where: {
        userId: req.user.id,
      },
      orderBy: {
        createdAt: sortBy || "asc",
      },
    });

    const folders = result.map((value) => ({
      ...value,
      createdAt: formatDistanceToNow(value.createdAt, { addSuffix: true, includeSeconds: true }),
      updatedAt: formatDistanceToNow(value.updatedAt, { addSuffix: true, includeSeconds: true }),
    }));

    const validationError = req.flash("validationError");

    res.render("storage", {
      folders,
      sortBy,
      flashMessageError: validationError.length > 0 ? validationError : null,
    });
  }),
];

exports.createFolder = [
  body("folderName").trim().notEmpty().withMessage("Folder name can not be empty."),
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      req.flash("validationError", errors.array({ onlyFirstError: true }));
      const referrer = req.header("referrer") || "/storage";
      res.redirect(referrer);
      return;
    }

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
