const { Router } = require("express");
const storageController = require("../controllers/storageController");

const storageRouter = Router();

storageRouter.get("/", storageController.getStoragePage);

module.exports = storageRouter;
