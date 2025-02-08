const { Router } = require("express");
const shareController = require("../controllers/shareController");

const shareRouter = Router();

shareRouter.get("/", shareController.getSharePage);
shareRouter.post("/create", shareController.createSharedFolder);

module.exports = shareRouter;
