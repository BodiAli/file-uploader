const fs = require("node:fs/promises");
const asyncHandler = require("express-async-handler");
const { formatDistanceToNow } = require("date-fns");
const { body, validationResult } = require("express-validator");
const multer = require("multer");
const byteSize = require("byte-size");
const axios = require("axios");
const { isAuthenticated } = require("./authenticationController");
const prisma = require("../prisma/prismaClient");
const cloudinary = require("../config/cloudinaryConfig");

const upload = multer({ dest: "uploads/" });

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
      files: result.files.map((value) => ({
        ...value,
        createdAt: formatDistanceToNow(value.createdAt, { addSuffix: true, includeSeconds: true }),
        updatedAt: formatDistanceToNow(value.updatedAt, { addSuffix: true, includeSeconds: true }),
        size: byteSize(value.size, { precision: 2 }),
      })),
    };

    console.dir(folder, { depth: null });

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

  body("uploadedFile").custom((value, { req }) => {
    if (req.file.size > 5242880) {
      throw new Error("File cannot be larger than 5MB");
    }
    return true;
  }),

  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      req.flash("validationError", errors.array({ onlyFirstError: true }));
      const referrer = req.header("referrer") || "/storage";
      res.redirect(referrer);
      return;
    }

    const id = Number(req.params.id);

    const { secure_url: url } = await cloudinary.uploader.upload(req.file.path, { resource_type: "auto" });

    await fs.rm(req.file.destination, { recursive: true });

    await prisma.file.create({
      data: {
        name: req.file.originalname,
        size: req.file.size,
        folderId: id,
        url,
      },
    });

    // // Use Axios to stream the file from Cloudinary
    // const response = await axios.get(file2.url, { responseType: "stream" });

    // // Set headers for file download
    // res.setHeader("Content-Disposition", `attachment; filename="${file2.name}"`);
    // res.setHeader("Content-Type", response.headers["content-type"] || "application/octet-stream");

    // // Stream the file to the response
    // response.data.pipe(res);

    const referrer = req.header("referrer") || "/storage";

    res.redirect(referrer);
  }),
];
