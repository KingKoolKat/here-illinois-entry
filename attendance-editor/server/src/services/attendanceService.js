const Attendance = require("../models/Attendance");
const loggingService = require("./loggingService");
const AppError = require("../utils/AppError");

function normalizeString(value) {
  return typeof value === "string" ? value.trim() : "";
}

function parseOptionalDate(value) {
  if (!value) {
    return new Date();
  }

  const parsedDate = new Date(value);

  if (Number.isNaN(parsedDate.getTime())) {
    throw new AppError("date must be a valid date value.", 400);
  }

  return parsedDate;
}

function parseUpdatableDate(value, currentDate) {
  if (value === undefined) {
    return currentDate;
  }

  if (value === null || value === "") {
    return null;
  }

  const parsedDate = new Date(value);

  if (Number.isNaN(parsedDate.getTime())) {
    throw new AppError("date must be a valid date value.", 400);
  }

  return parsedDate;
}

function validateCreatePayload(payload) {
  const missingFields = [];

  if (!normalizeString(payload.uin)) {
    missingFields.push("uin");
  }

  if (!normalizeString(payload.classId)) {
    missingFields.push("classId");
  }

  if (!normalizeString(payload.takenBy)) {
    missingFields.push("takenBy");
  }

  if (missingFields.length > 0) {
    throw new AppError(
      `Missing required fields: ${missingFields.join(", ")}.`,
      400,
    );
  }
}

function validateFullUpdatePayload(payload) {
  const missingFields = [];

  if (!normalizeString(payload.uin)) {
    missingFields.push("uin");
  }

  if (!normalizeString(payload.classId)) {
    missingFields.push("classId");
  }

  if (!normalizeString(payload.takenBy)) {
    missingFields.push("takenBy");
  }

  if (!normalizeString(payload.editedBy)) {
    missingFields.push("editedBy");
  }

  if (missingFields.length > 0) {
    throw new AppError(
      `Missing required fields: ${missingFields.join(", ")}.`,
      400,
    );
  }
}

function validateSearchUin(uin) {
  const normalizedUin = normalizeString(uin);

  if (!normalizedUin) {
    throw new AppError("uin query parameter is required.", 400);
  }

  return normalizedUin;
}

async function createAttendance(payload = {}) {
  validateCreatePayload(payload);

  const attendanceData = {
    uin: normalizeString(payload.uin),
    classId: normalizeString(payload.classId),
    date: parseOptionalDate(payload.date),
    takenBy: normalizeString(payload.takenBy),
  };

  const existingAttendance = await Attendance.findOne({
    uin: attendanceData.uin,
    classId: attendanceData.classId,
  });

  if (existingAttendance) {
    throw new AppError("Attendance record already exists.", 409);
  }

  try {
    const attendance = await Attendance.create(attendanceData);
    await loggingService.logCreateAttendance(attendance, attendanceData.takenBy);

    return attendance;
  } catch (error) {
    if (error.code === 11000) {
      throw new AppError("Attendance record already exists.", 409);
    }

    throw error;
  }
}

async function getAttendanceByUin(uin) {
  const normalizedUin = validateSearchUin(uin);
  return Attendance.find({ uin: normalizedUin }).sort({
    date: -1,
    createdAt: -1,
  });
}

async function updateAttendanceById(id, payload = {}) {
  const attendanceId = normalizeString(id);

  if (!attendanceId) {
    throw new AppError("Attendance id is required.", 400);
  }

  validateFullUpdatePayload(payload);

  const attendance = await Attendance.findById(attendanceId);

  if (!attendance) {
    throw new AppError("Attendance record was not found.", 404);
  }

  const nextUin = normalizeString(payload.uin);
  const nextClassId = normalizeString(payload.classId);
  const nextTakenBy = normalizeString(payload.takenBy);
  const editedBy = normalizeString(payload.editedBy);

  const existingAttendance = await Attendance.findOne({
    uin: nextUin,
    classId: nextClassId,
    _id: { $ne: attendance._id },
  });

  if (existingAttendance) {
    throw new AppError("Attendance record already exists.", 409);
  }

  const before = loggingService.buildAttendanceSnapshot(attendance);

  attendance.uin = nextUin;
  attendance.classId = nextClassId;
  attendance.takenBy = nextTakenBy;
  attendance.date = parseUpdatableDate(payload.date, attendance.date);

  try {
    await attendance.save();
  } catch (error) {
    if (error.code === 11000) {
      throw new AppError("Attendance record already exists.", 409);
    }

    throw error;
  }

  const after = loggingService.buildAttendanceSnapshot(attendance);

  await loggingService.logUpdateAttendance({
    before,
    after,
    actor: editedBy,
    attendanceId: attendance._id,
  });

  return attendance;
}

module.exports = {
  createAttendance,
  getAttendanceByUin,
  updateAttendanceById,
};
