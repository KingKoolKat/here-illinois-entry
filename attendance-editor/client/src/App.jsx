import { BrowserRouter, NavLink, Route, Routes } from "react-router-dom";
import EditorPage from "./pages/EditorPage";
import LogsPage from "./pages/LogsPage";

function App() {
  return (
    <BrowserRouter>
      <div className="app-shell">
        <header className="app-header">
          <div>
            <p className="eyebrow">Attendance Editor</p>
            <h1>Instructor attendance corrections</h1>
            <p className="subtitle">
              Add missing attendance, correct incorrect class sessions, and
              review every logged change.
            </p>
          </div>
          <nav className="nav-links">
            <NavLink
              to="/"
              className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
            >
              Editor
            </NavLink>
            <NavLink
              to="/logs"
              className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
            >
              Logs
            </NavLink>
          </nav>
        </header>

        <main>
          <Routes>
            <Route path="/" element={<EditorPage />} />
            <Route path="/logs" element={<LogsPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
