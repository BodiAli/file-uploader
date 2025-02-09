const asyncHandler = require("express-async-handler");
const { v4: uuidv4 } = require("uuid");
const axios = require("axios");
const byteSize = require("byte-size");
const { differenceInMinutes } = require("date-fns");
const prisma = require("../prisma/prismaClient");
const NotFoundError = require("../errors/customNotFoundError");
const GoneError = require("../errors/customGoneError");

exports.getSharePage = asyncHandler(async (req, res) => {
  const result = await prisma.folder.findMany({
    where: {
      shared: true,
      userId: req.user.id,
    },
    omit: {
      createdAt: true,
      updatedAt: true,
    },
  });

  const sharedFolders = result.map((folder) => ({
    ...folder,
    shareExpires: differenceInMinutes(folder.shareExpires, new Date()),
  }));

  const folders = await prisma.folder.findMany({
    where: {
      userId: req.user.id,
      shared: false,
    },
    orderBy: {
      name: "asc",
    },
  });

  res.render("share", { sharedFolders, folders });
});

exports.getSharedFolder = asyncHandler(async (req, res) => {
  const { token } = req.params;

  const result = await prisma.folder.findUnique({
    where: {
      shareToken: token,
    },
    include: {
      files: {
        orderBy: {
          name: "asc",
        },
      },
      user: {
        select: {
          username: true,
        },
      },
    },
  });

  if (!result) {
    throw new NotFoundError("Invalid share link");
  }

  if (result.shareExpires < new Date()) {
    throw new GoneError("This shared link has expired.");
  }

  const sharedFolder = {
    ...result,
    files: result.files.map((value) => ({
      ...value,
      size: byteSize(value.size, { precision: 2 }),
    })),
  };

  const connectionError = req.flash("connectionError");

  res.render("shared-folder", {
    sharedFolder,
    flashMessageError: connectionError.length > 0 ? connectionError : null,
  });
});

exports.createSharedFolder = [
  asyncHandler(async (req, res) => {
    const { folders: foldersId, duration } = req.body;

    const durationHours = Number(duration);
    const durationMs = durationHours * 60 * 60 * 1000;
    const expiresAt = new Date(Date.now() + durationMs);

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

exports.downloadFile = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const file = await prisma.file.findUnique({
    where: {
      id,
      Folder: {
        shared: true,
      },
    },
  });

  if (!file) {
    throw new NotFoundError("File not found");
  }

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

    const referrer = req.header("referrer") || "/share";
    res.redirect(referrer);
  }
});
