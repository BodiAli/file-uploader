const { Router } = require("express");
const storageController = require("../controllers/storageController");

const storageRouter = Router();

storageRouter.get("/", storageController.getStoragePage);

storageRouter.post("/folder/create", storageController.createFolder);

module.exports = storageRouter;
