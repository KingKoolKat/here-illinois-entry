const express = require("express");
const cors = require("cors");

const attendanceRoutes = require("./routes/attendanceRoutes");
const logRoutes = require("./routes/logRoutes");
const notFound = require("./middleware/notFound");
const errorHandler = require("./middleware/errorHandler");

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || true,
  }),
);
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/attendance", attendanceRoutes);
app.use("/logs", logRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
