const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5001";

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Request failed.");
  }

  return data;
}

export function createAttendance(payload) {
  return request("/attendance", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function getAttendanceByUin(uin) {
  const query = new URLSearchParams({ uin });
  return request(`/attendance/search?${query.toString()}`);
}

export function updateAttendance(id, payload) {
  return request(`/attendance/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function fetchLogs() {
  return request("/logs");
}
