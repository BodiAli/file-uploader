const fs = require("node:fs/promises");
const asyncHandler = require("express-async-handler");
const { formatDistanceToNow } = require("date-fns");
const { body, validationResult } = require("express-validator");
const multer = require("multer");
const byteSize = require("byte-size");
const axios = require("axios");
const prisma = require("../prisma/prismaClient");
const cloudinary = require("../config/cloudinaryConfig");
const NotFoundError = require("../errors/customNotFoundError");

const upload = multer({ dest: "uploads/" });

exports.getStoragePage = asyncHandler(async (req, res) => {
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
});

exports.getFolderPage = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);

  if (Number.isNaN(id)) {
    throw new NotFoundError("Folder not found");
  }

  const result = await prisma.folder.findUnique({
    where: {
      id,
      userId: req.user.id,
    },
    include: {
      files: true,
      subFolders: true,
      parent: true,
    },
  });

  if (!result) {
    throw new NotFoundError("Folder not found");
  }

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

  const validationError = req.flash("validationError");

  res.render("folder", { folder, flashMessageError: validationError.length > 0 ? validationError : null });
});

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

  try {
    await prisma.folder.delete({
      where: {
        id,
      },
    });
  } catch (error) {
    if (error.code === "P2003") {
      req.flash("validationError", {
        msg: "Please delete all files inside the folder before attempting to delete it",
      });

      const referrer = req.header("referrer") || "/storage";
      res.redirect(referrer);
      return;
    }
  }

  const referrer = req.header("referrer") || "/storage";

  res.redirect(referrer);
});

exports.getFilePage = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);

  if (Number.isNaN(id)) {
    throw new NotFoundError("File not found");
  }

  const result = await prisma.file.findUnique({
    where: {
      id,
      Folder: {
        userId: req.user.id,
      },
    },
    include: {
      Folder: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  if (!result) {
    throw new NotFoundError("File not found");
  }

  const file = {
    ...result,
    size: byteSize(result.size, { precision: 2 }),
    createdAt: formatDistanceToNow(result.createdAt, { addSuffix: true, includeSeconds: true }),
    updatedAt: formatDistanceToNow(result.updatedAt, { addSuffix: true, includeSeconds: true }),
  };

  const connectionError = req.flash("connectionError");

  res.render("file", { file, flashMessageError: connectionError.length > 0 ? connectionError : null });
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

    const {
      secure_url: url,
      public_id: cloudId,
      resource_type: resourceType,
    } = await cloudinary.uploader.upload(req.file.path, {
      resource_type: "auto",
    });

    await fs.rm(req.file.path);

    await prisma.file.create({
      data: {
        name: req.file.originalname,
        size: req.file.size,
        folderId: id,
        url,
        cloudId,
        resourceType,
      },
    });

    const referrer = req.header("referrer") || "/storage";

    res.redirect(referrer);
  }),
];

exports.updateFile = [
  body("fileName").trim().notEmpty().withMessage("File name can not be empty."),
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      req.flash("validationError", errors.array({ onlyFirstError: true }));
      const referrer = req.header("referrer") || "/storage";
      res.redirect(referrer);
      return;
    }

    const id = Number(req.params.id);

    await prisma.file.update({
      data: {
        name: req.body.fileName,
      },
      where: {
        id,
      },
    });

    const referrer = req.header("referrer") || "/storage";

    res.redirect(referrer);
  }),
];

exports.deleteFile = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);

  const file = await prisma.file.findUnique({
    where: {
      id,
    },
  });

  try {
    const { result } = await cloudinary.uploader.destroy(file.cloudId, { resource_type: file.resourceType });

    if (result !== "ok") {
      throw new Error("Error deleting file");
    }

    await prisma.file.delete({
      where: {
        id,
      },
    });

    const referrer = req.header("referrer") || "/storage";

    res.redirect(referrer);
  } catch (error) {
    req.flash("validationError", {
      msg: "Error deleting file, please check your connection and try again.",
    });

    const referrer = req.header("referrer") || "/storage";
    res.redirect(referrer);
  }
});

exports.downloadFile = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const file = await prisma.file.findUnique({
    where: {
      id,
    },
  });
  try {
    // Use Axios to stream the file from Cloudinary
    const response = await axios.get(file.url, { responseType: "stream" });

    if (response.statusText !== "OK") {
      throw new Error("Connection error");
    }

    // Set headers for file download
    res.setHeader("Content-Disposition", `attachment; filename="${file.name}"`);
    res.setHeader("Content-Type", response.headers["content-type"] || "application/octet-stream");

    // Stream the file to the response
    response.data.pipe(res);
  } catch (error) {
    req.flash("connectionError", {
      msg: "Error downloading file, please check your connection and try again.",
    });
    res.redirect(`/storage/file/${file.id}`);
  }
});
