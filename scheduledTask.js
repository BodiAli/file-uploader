const cron = require("node-cron");
const prisma = require("./prisma/prismaClient");

cron.schedule("* * * * *", async () => {
  try {
    const now = new Date();

    // Update all folders whose shareExpires is in the past
    await prisma.folder.updateMany({
      where: {
        shared: true,
        shareExpires: {
          lt: now,
        },
      },
      data: {
        shared: false,
      },
    });
  } catch (error) {
    console.error(error);
  }
});
