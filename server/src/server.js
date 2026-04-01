require("dotenv").config();

const app = require("./app");
const { connectDatabase } = require("./config/db");

const PORT = process.env.PORT || 5001;

async function startServer() {
  await connectDatabase();

  app.listen(PORT, () => {
    console.log(`Attendance server listening on port ${PORT}`);
  });
}

if (require.main === module) {
  startServer().catch((error) => {
    console.error("Failed to start the server.", error);
    process.exit(1);
  });
}

module.exports = { startServer };
