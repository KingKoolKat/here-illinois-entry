const attendanceService = require("../services/attendanceService");

async function createAttendance(req, res, next) {
  try {
    const attendance = await attendanceService.createAttendance(req.body);

    res.status(201).json({
      message: "Attendance created successfully.",
      attendance,
    });
  } catch (error) {
    next(error);
  }
}

async function getAttendanceByUin(req, res, next) {
  try {
    const attendances = await attendanceService.getAttendanceByUin(req.query.uin);

    res.status(200).json({ attendances });
  } catch (error) {
    next(error);
  }
}

async function updateAttendance(req, res, next) {
  try {
    const attendance = await attendanceService.updateAttendanceById(
      req.params.id,
      req.body,
    );

    res.status(200).json({
      message: "Attendance updated successfully.",
      attendance,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createAttendance,
  getAttendanceByUin,
  updateAttendance,
};
