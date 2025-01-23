const { Router } = require("express");

const authenticationController = require("../controllers/authenticationController");

const authenticationRouter = Router();

authenticationRouter.get("/sign-up", authenticationController.getSignUpPage);
authenticationRouter.post("/sign-up", authenticationController.createUser);

authenticationRouter.get("/log-in", authenticationController.getLoginPage);
authenticationRouter.post("/log-in", authenticationController.authenticateUser);

authenticationRouter.get("/log-out", authenticationController.logOut);

module.exports = authenticationRouter;
