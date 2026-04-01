const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema(
  {
    uin: {
      type: String,
      required: true,
      trim: true,
    },
    classId: {
      type: String,
      required: true,
      trim: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    takenBy: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

attendanceSchema.index({ uin: 1, classId: 1 }, { unique: true });

module.exports = mongoose.model("Attendance", attendanceSchema);
