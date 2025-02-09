require("dotenv").config();
const express = require("express");
const flash = require("connect-flash");
const session = require("express-session");
const { PrismaSessionStore } = require("@quixo3/prisma-session-store");
const passport = require("passport");
const prisma = require("./prisma/prismaClient");
const { isAuthenticated } = require("./controllers/authenticationController");
const indexRouter = require("./routes/indexRouter");
const authenticationRouter = require("./routes/authenticationRouter");
const storageRouter = require("./routes/storageRouter");
const shareRouter = require("./routes/shareRouter");

require("./config/passportConfig");

const app = express();

app.set("view engine", "ejs");

app.use(express.static("public"));
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    store: new PrismaSessionStore(prisma, {
      dbRecordIdIsSessionId: true,
    }),
    cookie: {
      maxAge: 14 * 24 * 3600000, // 2 weeks
    },
  })
);
app.use(flash());
app.use(passport.session());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  next();
});
app.use((req, res, next) => {
  res.locals.currentPath = req.path;
  next();
});

require("./scheduledTask");

app.use("/", indexRouter);
app.use("/", authenticationRouter);
app.use("/storage", isAuthenticated, storageRouter);
app.use("/share", shareRouter);

app.use((req, res) => {
  res.render("404-lost");
});

app.use((err, req, res, _next) => {
  if (err.statusCode) {
    res.status(err.statusCode).render("error", { error: err });
    return;
  }
  console.error(err);
  res.status(500).send(err.message);
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`App running on port ${port}`);
});
