const mongoose = require("mongoose");
const request = require("supertest");
const { MongoMemoryServer } = require("mongodb-memory-server");

const app = require("../../src/app");
const Attendance = require("../../src/models/Attendance");
const { connectDatabase, disconnectDatabase } = require("../../src/config/db");

jest.setTimeout(20000);

describe("attendance API", () => {
  let mongoServer;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create({
      instance: {
        ip: "127.0.0.1",
      },
    });
    await connectDatabase(mongoServer.getUri());
  });

  afterEach(async () => {
    if (mongoose.connection.readyState === 0) {
      return;
    }

    const collections = Object.values(mongoose.connection.collections);
    await Promise.all(collections.map((collection) => collection.deleteMany({})));
  });

  afterAll(async () => {
    await disconnectDatabase();

    if (mongoServer) {
      await mongoServer.stop();
    }
  });

  test("rejected duplicate create returns a 409 error", async () => {
    const attendancePayload = {
      uin: "12345678",
      classId: "20251001",
      takenBy: "Jack",
    };

    const firstResponse = await request(app)
      .post("/attendance")
      .send(attendancePayload);

    expect(firstResponse.status).toBe(201);

    const duplicateResponse = await request(app)
      .post("/attendance")
      .send({
        uin: "12345678",
        classId: "20251001",
        takenBy: "Jack",
      });

    expect(duplicateResponse.status).toBe(409);
    expect(duplicateResponse.body).toEqual({
      message: "Attendance record already exists.",
    });
  });

  test("allows multiple records for one student and returns them from search", async () => {
    const firstResponse = await request(app).post("/attendance").send({
      uin: "33334444",
      classId: "20251003",
      date: "2025-10-03T14:45:00.000Z",
      takenBy: "Jack",
    });

    expect(firstResponse.status).toBe(201);

    await new Promise((resolve) => setTimeout(resolve, 10));

    const secondResponse = await request(app).post("/attendance").send({
      uin: "33334444",
      classId: "20251004",
      date: "2025-10-04T09:00:00.000Z",
      takenBy: "Jack",
    });

    expect(secondResponse.status).toBe(201);

    const searchResponse = await request(app)
      .get("/attendance/search")
      .query({ uin: "33334444" });

    expect(searchResponse.status).toBe(200);
    expect(searchResponse.body.attendances).toHaveLength(2);
    expect(searchResponse.body.attendances[0]).toMatchObject({
      uin: "33334444",
      classId: "20251004",
      takenBy: "Jack",
    });
    expect(searchResponse.body.attendances[1]).toMatchObject({
      uin: "33334444",
      classId: "20251003",
      takenBy: "Jack",
    });
  });

  test("updates one selected attendance record and logs the change", async () => {
    const firstCreateResponse = await request(app).post("/attendance").send({
      uin: "33334444",
      classId: "20251003",
      date: "2025-10-03T14:45:00.000Z",
      takenBy: "Jack",
    });

    expect(firstCreateResponse.status).toBe(201);

    await new Promise((resolve) => setTimeout(resolve, 10));

    const secondCreateResponse = await request(app).post("/attendance").send({
      uin: "33334444",
      classId: "20251004",
      date: "2025-10-04T09:00:00.000Z",
      takenBy: "Jack",
    });

    expect(secondCreateResponse.status).toBe(201);

    const firstAttendanceId = firstCreateResponse.body.attendance._id;
    const secondAttendanceId = secondCreateResponse.body.attendance._id;

    await new Promise((resolve) => setTimeout(resolve, 10));

    const updateResponse = await request(app)
      .put(`/attendance/${firstAttendanceId}`)
      .send({
        uin: "55556666",
        classId: "20251010",
        date: "2025-10-10T16:00:00.000Z",
        takenBy: "Professor Lee",
        editedBy: "Jack",
      });

    expect(updateResponse.status).toBe(200);
    expect(updateResponse.body.attendance).toMatchObject({
      _id: firstAttendanceId,
      uin: "55556666",
      classId: "20251010",
      takenBy: "Professor Lee",
    });
    expect(updateResponse.body.attendance.date).toBe("2025-10-10T16:00:00.000Z");

    const unchangedAttendance = await Attendance.findById(secondAttendanceId);

    expect(unchangedAttendance).toMatchObject({
      uin: "33334444",
      classId: "20251004",
      takenBy: "Jack",
    });

    const logsResponse = await request(app).get("/logs");

    expect(logsResponse.status).toBe(200);
    expect(logsResponse.body.logs).toHaveLength(3);
    expect(logsResponse.body.logs[0]).toMatchObject({
      action: "UPDATE",
      actor: "Jack",
      uin: "55556666",
      before: expect.objectContaining({
        uin: "33334444",
        classId: "20251003",
      }),
      after: expect.objectContaining({
        uin: "55556666",
        classId: "20251010",
        takenBy: "Professor Lee",
      }),
    });
    expect(logsResponse.body.logs[1]).toMatchObject({
      action: "CREATE",
      uin: "33334444",
      after: expect.objectContaining({ classId: "20251004" }),
    });
    expect(logsResponse.body.logs[2]).toMatchObject({
      action: "CREATE",
      uin: "33334444",
      after: expect.objectContaining({ classId: "20251003" }),
    });
  });

  test("rejects a full update when another record already has the same uin and classId", async () => {
    const firstAttendance = await Attendance.create({
      uin: "44445555",
      classId: "20251003",
      takenBy: "Jack",
    });

    await Attendance.create({
      uin: "44445555",
      classId: "20251004",
      takenBy: "Jack",
    });

    const conflictResponse = await request(app)
      .put(`/attendance/${firstAttendance.id}`)
      .send({
        uin: "44445555",
        classId: "20251004",
        date: "2025-10-10T16:00:00.000Z",
        takenBy: "Professor Lee",
        editedBy: "Jack",
      });

    expect(conflictResponse.status).toBe(409);
    expect(conflictResponse.body).toEqual({
      message: "Attendance record already exists.",
    });
  });
});
