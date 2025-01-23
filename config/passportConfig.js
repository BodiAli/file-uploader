const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");
const prisma = require("../prisma/prismaClient");

passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      const user = await prisma.user.findUnique({
        where: {
          username,
        },
      });

      if (!user) {
        done(null, false, { message: "Incorrect username or password" });
        return;
      }
      const matchPassword = await bcrypt.compare(password, user.password);

      if (!matchPassword) {
        done(null, false, { message: "Incorrect username or password" });
        return;
      }

      done(null, user);
    } catch (error) {
      done(error);
    }
  })
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id,
      },
    });

    if (!user) {
      done(null, null);
      return;
    }

    done(null, user);
  } catch (error) {
    done(error);
  }
});
