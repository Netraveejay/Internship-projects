import React from "react";
import LiveChart from "../components/livechart/LiveChart"; // ✅ default import

function LivePage({ theme }) {
  return (
    <div className={`page ${theme}`}>
      <h2>Live Chart</h2>
      <LiveChart theme={theme} /> {/* pass theme */}
    </div>
  );
}

export default LivePage;
