import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, NavLink, Route, Routes } from "react-router-dom";
import DashboardPage from "./pages/DashboardPage";
import UsersPage from "./pages/UsersPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import "leaflet/dist/leaflet.css";
import "./styles.css";

function App() {
  return (
    <BrowserRouter>
      <div className="layout">
        <aside className="sidebar">
          <h2>RideWave Admin</h2>
          <NavLink to="/">Dashboard</NavLink>
          <NavLink to="/users">User Management</NavLink>
          <NavLink to="/analytics">Analytics</NavLink>
        </aside>
        <main className="content">
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/users" element={<UsersPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

createRoot(document.getElementById("root")).render(<App />);
