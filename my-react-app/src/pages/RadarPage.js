import React from "react";
import RadarChart from "../components/radar/RadarChart"; // ✅ default import

function RadarPage({ theme }) {
  return (
    <div className={`page ${theme}`}>
      <h2>Radar Chart</h2>
      <RadarChart theme={theme} /> {/* pass theme */}
    </div>
  );
}

export default RadarPage;
