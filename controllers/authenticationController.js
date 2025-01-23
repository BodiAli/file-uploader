const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcrypt");
const passport = require("passport");
const prisma = require("../prisma/prismaClient");

exports.getSignUpPage = (req, res) => {
  res.render("sign-up");
};

exports.getLoginPage = (req, res) => {
  const authenticationError = req.flash("error");

  res.render("log-in", { authenticationError });
};

const emptyErr = "can not be empty.";

const validateUser = [
  body("username")
    .trim()
    .notEmpty()
    .withMessage(`Username ${emptyErr}`)
    .custom(async (value) => {
      const user = await prisma.user.findUnique({
        where: {
          username: value,
        },
      });

      if (user) {
        throw new Error("A user with this username already exists.");
      }

      return true;
    }),
  body("password")
    .trim()
    .notEmpty()
    .withMessage(`Password ${emptyErr}`)
    .isLength({ min: 5 })
    .withMessage("Password must be at least 5 characters or longer."),
  body("confirmPassword").custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error("Password and password confirmation do not match.");
    }
    return true;
  }),
];

exports.createUser = [
  validateUser,
  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.render("sign-up", { errors: errors.array() });
      return;
    }
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        password: hashedPassword,
        username,
      },
    });

    req.logIn(user, (err) => {
      if (err) {
        next(err);
        return;
      }
      res.redirect("/");
    });
  }),
];

const validateLogIn = [
  body("username").trim().notEmpty().withMessage(`Username ${emptyErr}`),
  body("password")
    .trim()
    .notEmpty()
    .withMessage(`Password ${emptyErr}`)
    .isLength({ min: 5 })
    .withMessage("Password must be at least 5 characters or longer."),
];

exports.authenticateUser = [
  validateLogIn,
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.render("log-in", { errors: errors.array() });
      return;
    }

    next();
  },
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/log-in",
    failureFlash: true,
  }),
];

exports.logOut = (req, res, next) => {
  req.logOut((err) => {
    if (err) {
      next(err);
      return;
    }
    res.redirect("/");
  });
};
