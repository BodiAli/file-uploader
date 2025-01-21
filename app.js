require("dotenv").config();
const express = require("express");
const flash = require("connect-flash");
const session = require("express-session");
const { PrismaSessionStore } = require("@quixo3/prisma-session-store");
const prisma = require("./prisma/prismaClient");

const app = express();

app.set("view engine", "ejs");
app.use(flash());
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    store: new PrismaSessionStore(prisma, {
      dbRecordIdIsSessionId: true,
    }),
  })
);

app.get("/", (req, res) => {
  res.send("koko");
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`App running on port ${port}`);
});
