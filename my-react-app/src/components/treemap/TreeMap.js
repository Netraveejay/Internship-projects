import React, { useMemo, useState, useEffect } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import TreemapModule from "highcharts/modules/treemap";
import { transformData } from "../../utils/treemapUtils";
import ErrorModal from "../ErrorModal";

const initTreemap = (mod) => {
  try {
    const fn = mod && (mod.default || mod);
    if (typeof fn === "function") fn(Highcharts);
  } catch (err) {
    console.debug("treemap init failed", err && err.message);
  }
};
initTreemap(TreemapModule);

function TreeMap({ data, type, loading }) {
  const [datasetError, setDatasetError] = useState(false);
  const [errorDismissed, setErrorDismissed] = useState(false);

  const formatted = useMemo(() => transformData(data, type), [data, type]);

  useEffect(() => {
    try {
      if (!Array.isArray(data) || formatted.length === 0) {
        setDatasetError(true);
      } else {
        setDatasetError(false);
      }
    } catch (err) {
      console.error("Treemap dataset error:", err);
      setDatasetError(true);
    }
  }, [data, formatted]);

  if (datasetError) {
    return (
      <div className="treemap-container">
        {!errorDismissed && (
          <div className="inline-error-box">
            <strong>Data Error</strong>
            <p>Failed to load treemap chart. Please try again.</p>

            <button
              className="reload-btn"
              onClick={() => window.location.reload()}
            >
              Reload
            </button>
          </div>
        )}
      </div>
    );
  }

  if (errorDismissed) {
    return (
      <div className="treemap-container">
        <div className="blank-page"></div>
      </div>
    );
  }

  if (loading) {
    // Shimmer loader matching treemap shape
    return (
      <div className="treemap-container">
        <div className="treemap-shimmer" />
      </div>
    );
  }

  const options = {
    chart: {
      backgroundColor: "var(--card-bg)",
      height: "500px",
    },
    title: {
      text:
        type === "sectors"
          ? "Sector-wise Market Cap"
          : "Company-wise Market Cap",
      style: { color: "var(--text-color)" },
    },
    colorAxis: {
      minColor: "#ff4d4f", // red for lowest
      maxColor: "#52c41a", // green for highest
      stops: [
        [0, "#ff4d4f"],
        [0.5, "#ffffff"], // neutral
        [1, "#52c41a"],
      ],
    },
    series: [
      {
        type: "treemap",
        layoutAlgorithm: "squarified",
        allowDrillToNode: true,
        dataLabels: {
          enabled: true,
          formatter() {
            return `${
              this.point.name
            }<br/><span style="font-weight: normal;">${this.point.value.toLocaleString()} Cr</span>`;
          },
          style: {
            textOutline: "none",
            color: "var(--text-color)",
            fontWeight: "bold",
          },
          useHTML: true,
        },
        levelIsConstant: false,
        levels: [
          {
            level: 1,
            dataLabels: { enabled: true },
            borderWidth: 3,
          },
        ],
        data: formatted,
      },
    ],
    tooltip: {
      backgroundColor: "var(--card-bg)",
      style: { color: "var(--text-color)" },
      formatter() {
        return `<b>${
          this.point.name
        }</b><br/>MCAP: ${this.point.value.toLocaleString()} Cr`;
      },
    },
  };

  return (
    <div className="treemap-container">
      <HighchartsReact highcharts={Highcharts} options={options} />
    </div>
  );
}

export default TreeMap;
