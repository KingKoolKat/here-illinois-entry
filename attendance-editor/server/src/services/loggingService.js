const Log = require("../models/Log");

function buildAttendanceSnapshot(attendance) {
  if (!attendance) {
    return null;
  }

  return {
    uin: attendance.uin,
    classId: attendance.classId,
    date: attendance.date,
    takenBy: attendance.takenBy,
  };
}

async function createLogEntry(payload) {
  return Log.create(payload);
}

async function logCreateAttendance(attendance, actor) {
  return createLogEntry({
    action: "CREATE",
    entityType: "Attendance",
    actor,
    uin: attendance.uin,
    attendanceId: attendance._id,
    before: null,
    after: buildAttendanceSnapshot(attendance),
    message: `Created attendance for student ${attendance.uin} in class ${attendance.classId}.`,
  });
}

async function logUpdateAttendance({ before, after, actor, attendanceId }) {
  return createLogEntry({
    action: "UPDATE",
    entityType: "Attendance",
    actor,
    uin: after.uin,
    attendanceId,
    before,
    after,
    message: `Updated attendance record from UIN ${before.uin} / class ${before.classId} to UIN ${after.uin} / class ${after.classId}.`,
  });
}

module.exports = {
  buildAttendanceSnapshot,
  createLogEntry,
  logCreateAttendance,
  logUpdateAttendance,
};
