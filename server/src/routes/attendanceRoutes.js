const express = require("express");

const attendanceController = require("../controllers/attendanceController");

const router = express.Router();

router.get("/search", attendanceController.getAttendanceByUin);
router.post("/", attendanceController.createAttendance);
router.put("/:id", attendanceController.updateAttendance);

module.exports = router;
