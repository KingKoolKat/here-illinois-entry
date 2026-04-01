import { useState } from "react";
import AttendanceForm from "../components/AttendanceForm";
import EditAttendanceForm from "../components/EditAttendanceForm";
import {
  createAttendance,
  getAttendanceByUin,
  updateAttendance,
} from "../api/attendanceApi";

function buildAttendanceTimestamp(
  attendanceDate,
  attendanceTime,
  emptyValue = undefined,
) {
  if (!attendanceDate && !attendanceTime) {
    return emptyValue;
  }

  if (!attendanceDate || !attendanceTime) {
    throw new Error("Enter both an attendance date and time, or leave both blank.");
  }

  const timestamp = new Date(`${attendanceDate}T${attendanceTime}`);

  if (Number.isNaN(timestamp.getTime())) {
    throw new Error("Enter a valid attendance date and time.");
  }

  return timestamp.toISOString();
}

function EditorPage() {
  const [addStatus, setAddStatus] = useState(null);
  const [editStatus, setEditStatus] = useState(null);
  const [addLoading, setAddLoading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);

  async function handleCreateAttendance(form) {
    setAddLoading(true);
    setAddStatus(null);

    try {
      const payload = {
        uin: form.uin,
        classId: form.classId,
        takenBy: form.takenBy,
        date: buildAttendanceTimestamp(
          form.attendanceDate,
          form.attendanceTime,
        ),
      };

      const response = await createAttendance(payload);
      setAddStatus({
        type: "success",
        message: `${response.attendance.uin} added to class ${response.attendance.classId}.`,
      });
      return true;
    } catch (error) {
      setAddStatus({
        type: "error",
        message: error.message,
      });
      return false;
    } finally {
      setAddLoading(false);
    }
  }

  async function handleEditAttendance(form) {
    setEditLoading(true);
    setEditStatus(null);

    try {
      const response = await updateAttendance(form.id, {
        uin: form.uin,
        classId: form.classId,
        date: buildAttendanceTimestamp(
          form.attendanceDate,
          form.attendanceTime,
          null,
        ),
        takenBy: form.takenBy,
        editedBy: form.editedBy,
      });
      setEditStatus({
        type: "success",
        message: `${response.attendance.uin} updated successfully.`,
      });
      return response.attendance;
    } catch (error) {
      setEditStatus({
        type: "error",
        message: error.message,
      });
      return null;
    } finally {
      setEditLoading(false);
    }
  }

  async function handleSearchAttendance(uin) {
    setSearchLoading(true);
    setEditStatus(null);

    try {
      const response = await getAttendanceByUin(uin);
      if (response.attendances.length === 0) {
        setEditStatus({
          type: "neutral",
          message: `No attendance records found for ${uin}.`,
        });
      } else {
        setEditStatus({
          type: "success",
          message: `Found ${response.attendances.length} attendance record(s) for ${uin}.`,
        });
      }
      return response.attendances;
    } catch (error) {
      setEditStatus({
        type: "error",
        message: error.message,
      });
      return [];
    } finally {
      setSearchLoading(false);
    }
  }

  return (
    <div className="page-grid">
      <AttendanceForm onSubmit={handleCreateAttendance} loading={addLoading} />
      <EditAttendanceForm
        onSearch={handleSearchAttendance}
        onSubmit={handleEditAttendance}
        loading={editLoading}
        searchLoading={searchLoading}
        status={editStatus}
      />

      <section className="panel status-panel">
        <h2>Recent results</h2>
        <p className={`status ${addStatus?.type || "neutral"}`}>
          {addStatus?.message || "No attendance create action yet."}
        </p>
        <p className={`status ${editStatus?.type || "neutral"}`}>
          {editStatus?.message || "No attendance edit action yet."}
        </p>
      </section>
    </div>
  );
}

export default EditorPage;
