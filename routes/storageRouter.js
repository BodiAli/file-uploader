const { Router } = require("express");
const storageController = require("../controllers/storageController");

const storageRouter = Router();

storageRouter.get("/", storageController.getStoragePage);
storageRouter.get("/folder/:id", storageController.getFolderPage);

storageRouter.get("/file/:id", storageController.getFilePage);

storageRouter.post("/folder/create", storageController.createFolder);
storageRouter.post("/folder/create/:id", storageController.createFolder);

storageRouter.post("/file/create/:id", storageController.createFile);

storageRouter.post("/folder/:id/edit", storageController.updateFolder);
storageRouter.post("/folder/:id/delete", storageController.deleteFolder);

storageRouter.post("/file/:id/edit", storageController.updateFile);
storageRouter.post("/file/:id/delete", storageController.deleteFile);

storageRouter.post("/file/:id/download", storageController.downloadFile);

module.exports = storageRouter;
