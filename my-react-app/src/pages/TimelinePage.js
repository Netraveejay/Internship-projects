// pages/TimelinePage.js
import React from "react";
import Timeline from "../components/timeline/Timeline";

function TimelinePage({ theme }) {
  return (
    <div className={`page ${theme}`}>
      <h2>Timeline Page</h2>
      <Timeline theme={theme} />
    </div>
  );
}

export default TimelinePage;
