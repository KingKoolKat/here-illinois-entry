import { useEffect, useState } from "react";
import { fetchLogs } from "../api/attendanceApi";
import LogList from "../components/LogList";

function LogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function loadLogs() {
    setLoading(true);
    setError("");

    try {
      const response = await fetchLogs();
      setLogs(response.logs);
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadLogs();
  }, []);

  return <LogList logs={logs} loading={loading} error={error} onRefresh={loadLogs} />;
}

export default LogsPage;
