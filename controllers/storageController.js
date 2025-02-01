const asyncHandler = require("express-async-handler");
const { formatDistanceToNow } = require("date-fns");
const { body, validationResult } = require("express-validator");
const multer = require("multer");
const { isAuthenticated } = require("./authenticationController");
const prisma = require("../prisma/prismaClient");

const upload = multer({ dest: "public/uploads/" });

exports.getStoragePage = [
  isAuthenticated,
  asyncHandler(async (req, res) => {
    const { sortBy } = req.query;

    const result = await prisma.folder.findMany({
      where: {
        userId: req.user.id,
        parentId: null,
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

exports.getFolderPage = [
  isAuthenticated,
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    const result = await prisma.folder.findUnique({
      where: {
        id,
      },
      include: {
        files: true,
        subFolders: true,
        parent: true,
      },
    });

    const folder = {
      ...result,
      subFolders: result.subFolders.map((value) => ({
        ...value,
        createdAt: formatDistanceToNow(value.createdAt, { addSuffix: true, includeSeconds: true }),
        updatedAt: formatDistanceToNow(value.updatedAt, { addSuffix: true, includeSeconds: true }),
      })),
      // files: result.files.map((value) => ({
      //   createdAt: formatDistanceToNow(value.createdAt, { addSuffix: true, includeSeconds: true }),
      //   updatedAt: formatDistanceToNow(value.updatedAt, { addSuffix: true, includeSeconds: true }),
      // })),
    };

    // console.dir(folder, { depth: null });

    const validationError = req.flash("validationError");

    res.render("folder", { folder, flashMessageError: validationError.length > 0 ? validationError : null });
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
    const id = Number(req.params.id);

    if (!id) {
      await prisma.folder.create({
        data: {
          name: req.body.folderName,
          userId: req.user.id,
        },
      });
    } else {
      await prisma.folder.create({
        data: {
          name: req.body.folderName,
          userId: req.user.id,
          parentId: id,
        },
      });
    }

    const referrer = req.header("referrer") || "/storage";

    res.redirect(referrer);
  }),
];

exports.updateFolder = [
  body("folderName").trim().notEmpty().withMessage("Folder name can not be empty."),
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      req.flash("validationError", errors.array({ onlyFirstError: true }));
      const referrer = req.header("referrer") || "/storage";
      res.redirect(referrer);
      return;
    }

    const id = Number(req.params.id);

    await prisma.folder.update({
      data: {
        name: req.body.folderName,
      },
      where: {
        id,
      },
    });

    const referrer = req.header("referrer") || "/storage";

    res.redirect(referrer);
  }),
];

exports.deleteFolder = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);

  await prisma.folder.delete({
    where: {
      id,
    },
  });

  const referrer = req.header("referrer") || "/storage";

  res.redirect(referrer);
});

exports.createFile = [
  upload.single("uploadedFile"),
  asyncHandler(async (req, res) => {
    console.log(req.file);
    const id = Number(req.params.id);

    const referrer = req.header("referrer") || "/storage";

    res.redirect(referrer);
  }),
];
