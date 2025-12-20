// pages/TimelinePage.js
import React from "react";
import Timeline from "../components/timeline/Timeline";

function TimelinePage({ theme }) {
  return (
    <div className={`page ${theme}`}>
      <Timeline theme={theme} />
    </div>
  );
}

export default TimelinePage;
