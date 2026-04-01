const Log = require("../models/Log");

async function getLogs(_req, res, next) {
  try {
    const logs = await Log.find().sort({ createdAt: -1 });

    res.status(200).json({ logs });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getLogs,
};
