import { useState } from "react";

const initialForm = {
  uin: "",
  classId: "",
  attendanceDate: "",
  attendanceTime: "",
  takenBy: "Jack",
};

function AttendanceForm({ onSubmit, loading }) {
  const [form, setForm] = useState(initialForm);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const succeeded = await onSubmit(form);

    if (succeeded) {
      setForm(initialForm);
    }
  }

  return (
    <section className="panel">
      <div className="panel-heading">
        <h2>Add attendance</h2>
        <p>Create a missing record for a student.</p>
      </div>

      <form className="form-grid" onSubmit={handleSubmit}>
        <label>
          Student UIN
          <input
            name="uin"
            value={form.uin}
            onChange={handleChange}
            placeholder="12345678"
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

        <button type="submit" disabled={loading}>
          {loading ? "Saving..." : "Create attendance"}
        </button>
      </form>
    </section>
  );
}

export default AttendanceForm;
