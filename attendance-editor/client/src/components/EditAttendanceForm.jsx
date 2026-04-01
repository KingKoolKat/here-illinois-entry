import { useState } from "react";

const initialForm = {
  id: "",
  uin: "",
  classId: "",
  attendanceDate: "",
  attendanceTime: "",
  takenBy: "Jack",
  editedBy: "Jack",
};

function formatDateInputValue(value) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatTimeInputValue(value) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${hours}:${minutes}`;
}

function formatDisplayDateTime(value) {
  if (!value) {
    return "No attendance timestamp";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Invalid attendance timestamp";
  }

  return date.toLocaleString();
}

function EditAttendanceForm({
  onSearch,
  onSubmit,
  loading,
  searchLoading,
  status,
}) {
  const [searchUin, setSearchUin] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [selectedRecordId, setSelectedRecordId] = useState("");

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));
  }

  async function handleSearch(event) {
    event.preventDefault();

    const attendances = await onSearch(searchUin);

    setSearchResults(attendances);
    setSelectedRecordId("");

    if (attendances.length === 0) {
      setForm((currentForm) => ({
        ...initialForm,
        editedBy: currentForm.editedBy || "Jack",
      }));
      return;
    }
  }

  function handleLoadRecord(attendance) {
    setSelectedRecordId(attendance._id);
    setForm((currentForm) => ({
      id: attendance._id,
      uin: attendance.uin || "",
      classId: attendance.classId || "",
      attendanceDate: formatDateInputValue(attendance.date),
      attendanceTime: formatTimeInputValue(attendance.date),
      takenBy: attendance.takenBy || "",
      editedBy: currentForm.editedBy || "Jack",
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const updatedAttendance = await onSubmit(form);

    if (updatedAttendance) {
      setSelectedRecordId(updatedAttendance._id);
      setForm((currentForm) => ({
        ...currentForm,
        id: updatedAttendance._id,
        uin: updatedAttendance.uin || "",
        classId: updatedAttendance.classId || "",
        attendanceDate: formatDateInputValue(updatedAttendance.date),
        attendanceTime: formatTimeInputValue(updatedAttendance.date),
        takenBy: updatedAttendance.takenBy || "",
      }));
      setSearchResults((currentResults) => {
        const nextResults = currentResults
          .map((attendance) =>
            attendance._id === updatedAttendance._id ? updatedAttendance : attendance,
          )
          .filter((attendance) => attendance.uin === searchUin);

        return nextResults;
      });
    }
  }

  return (
    <section className="panel">
      <div className="panel-heading">
        <h2>Edit attendance</h2>
        <p>Search by student UIN, load the record, then edit any field.</p>
      </div>

      <form className="form-grid" onSubmit={handleSearch}>
        <label>
          Search by student UIN
          <input
            value={searchUin}
            onChange={(event) => setSearchUin(event.target.value)}
            placeholder="87654321"
            required
          />
        </label>

        <button type="submit" disabled={searchLoading}>
          {searchLoading ? "Searching..." : "Load attendance record"}
        </button>
      </form>

      {status ? (
        <p className={`status ${status.type || "neutral"}`}>{status.message}</p>
      ) : null}

      {searchResults.length > 0 ? (
        <div className="search-results">
          <h3 className="results-heading">Matching attendance records</h3>
          <div className="results-list">
            {searchResults.map((attendance) => (
              <article
                key={attendance._id}
                className={
                  attendance._id === selectedRecordId
                    ? "result-card selected"
                    : "result-card"
                }
              >
                <div>
                  <p className="result-title">{attendance.classId}</p>
                  <p className="result-detail">
                    {formatDisplayDateTime(attendance.date)}
                  </p>
                  <p className="result-detail">Taken by {attendance.takenBy}</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleLoadRecord(attendance)}
                  className="secondary-button"
                >
                  {attendance._id === selectedRecordId ? "Loaded" : "Load"}
                </button>
              </article>
            ))}
          </div>
        </div>
      ) : (
        <p className="helper-text">
          Search by UIN to see all attendance records for that student.
        </p>
      )}

      {selectedRecordId ? (
        <form className="form-grid record-form" onSubmit={handleSubmit}>
          <label>
            Student UIN
            <input
              name="uin"
              value={form.uin}
              onChange={handleChange}
              placeholder="87654321"
              required
            />
          </label>

          <label>
            Class session ID
            <input
              name="classId"
              value={form.classId}
              onChange={handleChange}
              placeholder="20251001"
              required
            />
          </label>

          <label>
            Attendance date
            <input
              name="attendanceDate"
              type="date"
              value={form.attendanceDate}
              onChange={handleChange}
            />
          </label>

          <label>
            Attendance time
            <input
              name="attendanceTime"
              type="time"
              step="60"
              value={form.attendanceTime}
              onChange={handleChange}
            />
          </label>

          <label>
            Taken by
            <input
              name="takenBy"
              value={form.takenBy}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Edited by
            <input
              name="editedBy"
              value={form.editedBy}
              onChange={handleChange}
              required
            />
          </label>

          <button type="submit" disabled={loading}>
            {loading ? "Updating..." : "Save all changes"}
          </button>
        </form>
      ) : searchResults.length > 0 ? (
        <p className="helper-text">
          Pick one record from the search results to load it into the editor.
        </p>
      ) : null}
    </section>
  );
}

export default EditAttendanceForm;
