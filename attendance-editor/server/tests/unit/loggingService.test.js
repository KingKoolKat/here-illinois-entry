jest.mock("../../src/models/Log", () => ({
  create: jest.fn(),
}));

const Log = require("../../src/models/Log");
const loggingService = require("../../src/services/loggingService");

describe("loggingService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("logging service creates correct log entries", async () => {
    const attendance = {
      _id: "attendance-1",
      uin: "12345678",
      classId: "20251001",
      date: new Date("2025-10-01T15:30:00.000Z"),
      takenBy: "Jack",
    };

    Log.create.mockResolvedValue({ _id: "log-1" });

    await loggingService.logCreateAttendance(attendance, "Jack");
    await loggingService.logUpdateAttendance({
      before: {
        uin: "12345678",
        classId: "20250931",
        date: attendance.date,
        takenBy: "Jack",
      },
      after: loggingService.buildAttendanceSnapshot(attendance),
      actor: "Jack",
      attendanceId: "attendance-1",
    });

    expect(Log.create).toHaveBeenNthCalledWith(1, {
      action: "CREATE",
      entityType: "Attendance",
      actor: "Jack",
      uin: "12345678",
      attendanceId: "attendance-1",
      before: null,
      after: {
        uin: "12345678",
        classId: "20251001",
        date: attendance.date,
        takenBy: "Jack",
      },
      message: "Created attendance for student 12345678 in class 20251001.",
    });

    expect(Log.create).toHaveBeenNthCalledWith(2, {
      action: "UPDATE",
      entityType: "Attendance",
      actor: "Jack",
      uin: "12345678",
      attendanceId: "attendance-1",
      before: {
        uin: "12345678",
        classId: "20250931",
        date: attendance.date,
        takenBy: "Jack",
      },
      after: {
        uin: "12345678",
        classId: "20251001",
        date: attendance.date,
        takenBy: "Jack",
      },
      message:
        "Updated attendance record from UIN 12345678 / class 20250931 to UIN 12345678 / class 20251001.",
    });
  });
});
