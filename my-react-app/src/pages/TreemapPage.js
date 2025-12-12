import React, { useState, useEffect } from "react";
import TreeMap from "../components/treemap/TreeMap";

import sectorData from "../data/data (3).json";
import companyData from "../data/data (4).json";

import "../styles/TreeMap.css";

function TreeMapPage() {
  const [active, setActive] = useState("sectors");
  const [isLoading, setIsLoading] = useState(true);

  // Simulate data load completion
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="treemap-page">
      <div className="treemap-header">
        <h2>Market Cap Treemap</h2>

        <button
          className="switch-btn"
          onClick={() =>
            setActive(active === "sectors" ? "companies" : "sectors")
          }
        >
          Switch to {active === "sectors" ? "Companies" : "Sectors"}
        </button>
      </div>

      <TreeMap
        type={active}
        data={active === "sectors" ? sectorData : companyData}
        loading={isLoading}
      />
    </div>
  );
}

export default TreeMapPage;
