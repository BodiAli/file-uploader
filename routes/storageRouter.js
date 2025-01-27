const { Router } = require("express");
const storageController = require("../controllers/storageController");

const storageRouter = Router();

storageRouter.get("/", storageController.getStoragePage);
storageRouter.get("/folder/:id", storageController.getFolderPage);

storageRouter.post("/folder/create", storageController.createFolder);

storageRouter.post("/folder/:id/edit", storageController.updateFolder);
storageRouter.post("/folder/:id/delete", storageController.deleteFolder);

module.exports = storageRouter;
