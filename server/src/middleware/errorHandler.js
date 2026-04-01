const AppError = require("../utils/AppError");

function errorHandler(error, _req, res, next) {
  if (res.headersSent) {
    return next(error);
  }

  let normalizedError = error;

  if (error.code === 11000) {
    normalizedError = new AppError("Attendance record already exists.", 409);
  }

  const statusCode = normalizedError.statusCode || 500;
  const message =
    statusCode === 500 ? "Internal server error." : normalizedError.message;

  if (statusCode === 500) {
    console.error(normalizedError);
  }

  res.status(statusCode).json({ message });
}

module.exports = errorHandler;
