function formatLogDetails(log) {
  if (log.action === "UPDATE" && log.before && log.after) {
    return `${log.before.classId} -> ${log.after.classId}`;
  }

  if (log.after?.classId) {
    return `class ${log.after.classId}`;
  }

  return log.message;
}

function LogList({ logs, loading, error, onRefresh }) {
  return (
    <section className="panel">
      <div className="panel-heading panel-row">
        <div>
          <h2>Attendance logs</h2>
          <p>Newest changes appear first.</p>
        </div>
        <button type="button" onClick={onRefresh} disabled={loading}>
          {loading ? "Refreshing..." : "Refresh logs"}
        </button>
      </div>

      {error ? <p className="status error">{error}</p> : null}

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Time</th>
              <th>Action</th>
              <th>UIN</th>
              <th>Actor</th>
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 ? (
              <tr>
                <td colSpan="5" className="empty-state">
                  No logs yet.
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log._id}>
                  <td>{new Date(log.createdAt).toLocaleString()}</td>
                  <td>{log.action}</td>
                  <td>{log.uin}</td>
                  <td>{log.actor}</td>
                  <td>{formatLogDetails(log)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default LogList;
