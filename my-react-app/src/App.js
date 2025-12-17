// App.js
import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";
import "./App.css";

// Pages
import RadarPage from "./pages/RadarPage";
import CalendarPage from "./pages/CalendarPage";
import TimelinePage from "./pages/TimelinePage";
import TreemapPage from "./pages/TreemapPage";
import StockPage from "./pages/StockPage"; // ✅ added stock page
import LiveChart from "./pages/LivePage";

import ThemeToggle from "./components/calendar/ThemeToggle";

function App() {
  // initialize from localStorage so theme persists across reloads
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem("theme") || "light";
    } catch (e) {
      return "light";
    }
  });

  useEffect(() => {
    document.body.className = theme; // apply body class for CSS
    try {
      localStorage.setItem("theme", theme);
    } catch (e) {
      // ignore
    }
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === "light" ? "dark" : "light"));

  return (
    <BrowserRouter>
      <nav className="navi-bar">
        <div className="navi-links">
          <NavLink
            to="/"
            className={({ isActive }) =>
              "navi-btn" + (isActive ? " active" : "")
            }
          >
            Radar
          </NavLink>
          <NavLink
            to="/calendar"
            className={({ isActive }) =>
              "navi-btn" + (isActive ? " active" : "")
            }
          >
            Calendar
          </NavLink>
          <NavLink
            to="/timeline"
            className={({ isActive }) =>
              "navi-btn" + (isActive ? " active" : "")
            }
          >
            Timeline
          </NavLink>
          <NavLink
            to="/treemap"
            className={({ isActive }) =>
              "navi-btn" + (isActive ? " active" : "")
            }
          >
            TreeMap
          </NavLink>
          <NavLink
            to="/stock" // ✅ added stock nav link
            className={({ isActive }) =>
              "navi-btn" + (isActive ? " active" : "")
            }
          >
            Stock
          </NavLink>
          <NavLink
            to="/live" // ✅ added stock nav link
            className={({ isActive }) =>
              "navi-btn" + (isActive ? " active" : "")
            }
          >
            Live
          </NavLink>
        </div>

        <div className="navi-controls">
          <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
        </div>
      </nav>

      <Routes>
        <Route path="/" element={<RadarPage theme={theme} />} />
        <Route
          path="/calendar"
          element={<CalendarPage theme={theme} setTheme={setTheme} />}
        />
        <Route path="/timeline" element={<TimelinePage theme={theme} />} />
        <Route path="/treemap" element={<TreemapPage theme={theme} />} />
        <Route path="/stock" element={<StockPage theme={theme} />} />{" "}
        {/* ✅ stock route */}
        <Route path="/live" element={<LiveChart theme={theme} />} />{" "}
        {/* live chart route */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
