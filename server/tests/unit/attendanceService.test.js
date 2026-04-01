jest.mock("../../src/models/Attendance", () => ({
  findOne: jest.fn(),
  find: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
}));

jest.mock("../../src/services/loggingService", () => ({
  buildAttendanceSnapshot: jest.fn(),
  logCreateAttendance: jest.fn(),
  logUpdateAttendance: jest.fn(),
}));

const Attendance = require("../../src/models/Attendance");
const loggingService = require("../../src/services/loggingService");
const attendanceService = require("../../src/services/attendanceService");

describe("attendanceService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("attendance creation success", async () => {
    const createdAttendance = {
      _id: "attendance-1",
      uin: "12345678",
      classId: "20251001",
      takenBy: "Jack",
    };

    Attendance.findOne.mockResolvedValue(null);
    Attendance.create.mockResolvedValue(createdAttendance);
    loggingService.logCreateAttendance.mockResolvedValue({});

    const result = await attendanceService.createAttendance({
      uin: "12345678",
      classId: "20251001",
      takenBy: "Jack",
    });

    expect(Attendance.findOne).toHaveBeenCalledWith({
      uin: "12345678",
      classId: "20251001",
    });
    expect(Attendance.create).toHaveBeenCalledWith(
      expect.objectContaining({
        uin: "12345678",
        classId: "20251001",
        takenBy: "Jack",
      }),
    );
    expect(loggingService.logCreateAttendance).toHaveBeenCalledWith(
      createdAttendance,
      "Jack",
    );
    expect(result).toBe(createdAttendance);
  });

  test("attendance creation validation failure", async () => {
    await expect(
      attendanceService.createAttendance({
        classId: "20251001",
        takenBy: "Jack",
      }),
    ).rejects.toMatchObject({
      statusCode: 400,
      message: "Missing required fields: uin.",
    });

    expect(Attendance.create).not.toHaveBeenCalled();
    expect(loggingService.logCreateAttendance).not.toHaveBeenCalled();
  });

  test("duplicate attendance rejection", async () => {
    Attendance.findOne.mockResolvedValue({
      _id: "existing",
      uin: "12345678",
      classId: "20251001",
    });

    await expect(
      attendanceService.createAttendance({
        uin: "12345678",
        classId: "20251001",
        takenBy: "Jack",
      }),
    ).rejects.toMatchObject({
      statusCode: 409,
      message: "Attendance record already exists.",
    });

    expect(Attendance.create).not.toHaveBeenCalled();
    expect(loggingService.logCreateAttendance).not.toHaveBeenCalled();
  });

  test("same uin with different classId is allowed", async () => {
    const createdAttendance = {
      _id: "attendance-2",
      uin: "12345678",
      classId: "20251002",
      takenBy: "Jack",
    };

    Attendance.findOne.mockResolvedValue(null);
    Attendance.create.mockResolvedValue(createdAttendance);
    loggingService.logCreateAttendance.mockResolvedValue({});

    const result = await attendanceService.createAttendance({
      uin: "12345678",
      classId: "20251002",
      takenBy: "Jack",
    });

    expect(Attendance.findOne).toHaveBeenCalledWith({
      uin: "12345678",
      classId: "20251002",
    });
    expect(result).toBe(createdAttendance);
  });

  test("attendance search returns multiple records for a uin", async () => {
    const attendances = [
      {
        _id: "attendance-3",
        uin: "12345678",
        classId: "20251002",
        takenBy: "Jack",
      },
      {
        _id: "attendance-4",
        uin: "12345678",
        classId: "20251001",
        takenBy: "Jack",
      },
    ];
    const sortMock = jest.fn().mockResolvedValue(attendances);

    Attendance.find.mockReturnValue({
      sort: sortMock,
    });

    const result = await attendanceService.getAttendanceByUin("12345678");

    expect(Attendance.find).toHaveBeenCalledWith({ uin: "12345678" });
    expect(sortMock).toHaveBeenCalledWith({
      date: -1,
      createdAt: -1,
    });
    expect(result).toBe(attendances);
  });

  test("full attendance update success", async () => {
    const existingAttendance = {
      _id: "attendance-5",
      uin: "11112222",
      classId: "20250931",
      date: new Date("2025-09-30T14:15:00.000Z"),
      takenBy: "Jack",
      save: jest.fn().mockResolvedValue(undefined),
    };

    Attendance.findById.mockResolvedValue(existingAttendance);
    Attendance.findOne.mockResolvedValue(null);
    loggingService.buildAttendanceSnapshot.mockImplementation((attendance) => ({
      uin: attendance.uin,
      classId: attendance.classId,
      date: attendance.date,
      takenBy: attendance.takenBy,
    }));

    const result = await attendanceService.updateAttendanceById("attendance-5", {
      uin: "99990000",
      classId: "20251015",
      date: "2025-10-15T09:30:00.000Z",
      takenBy: "Professor Lee",
      editedBy: "Jack",
    });

    expect(Attendance.findById).toHaveBeenCalledWith("attendance-5");
    expect(Attendance.findOne).toHaveBeenCalledWith({
      uin: "99990000",
      classId: "20251015",
      _id: { $ne: "attendance-5" },
    });
    expect(existingAttendance.uin).toBe("99990000");
    expect(existingAttendance.classId).toBe("20251015");
    expect(existingAttendance.takenBy).toBe("Professor Lee");
    expect(existingAttendance.date).toEqual(
      new Date("2025-10-15T09:30:00.000Z"),
    );
    expect(existingAttendance.save).toHaveBeenCalledTimes(1);
    expect(loggingService.logUpdateAttendance).toHaveBeenCalledWith(
      expect.objectContaining({
        actor: "Jack",
        attendanceId: "attendance-5",
        before: expect.objectContaining({
          uin: "11112222",
          classId: "20250931",
        }),
        after: expect.objectContaining({
          uin: "99990000",
          classId: "20251015",
          takenBy: "Professor Lee",
        }),
      }),
    );
    expect(result).toBe(existingAttendance);
  });

  test("full attendance update rejects duplicate uin and classId combination", async () => {
    const existingAttendance = {
      _id: "attendance-6",
      uin: "11112222",
      classId: "20250931",
      date: new Date("2025-09-30T14:15:00.000Z"),
      takenBy: "Jack",
      save: jest.fn(),
    };

    Attendance.findById.mockResolvedValue(existingAttendance);
    Attendance.findOne.mockResolvedValue({
      _id: "attendance-7",
      uin: "22223333",
      classId: "20251001",
    });

    await expect(
      attendanceService.updateAttendanceById("attendance-6", {
        uin: "22223333",
        classId: "20251001",
        date: "2025-10-15T09:30:00.000Z",
        takenBy: "Professor Lee",
        editedBy: "Jack",
      }),
    ).rejects.toMatchObject({
      statusCode: 409,
      message: "Attendance record already exists.",
    });

    expect(existingAttendance.save).not.toHaveBeenCalled();
    expect(loggingService.logUpdateAttendance).not.toHaveBeenCalled();
  });
});
