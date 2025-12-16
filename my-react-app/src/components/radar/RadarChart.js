import React, { useState, useEffect } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import data from "../../data/data (1).json";
import { buildSeries } from "../../utils/radarUtils";
import "../../styles/RadarChart.css";
import ErrorModal from "../ErrorModal";

try {
  require("highcharts/highcharts-more")(Highcharts);
} catch (err) {
  if (typeof console !== "undefined")
    console.debug("highcharts-more init fallback", err.message);
}

function RadarChart({ theme }) {
  const [loading, setLoading] = useState(true);
  const [seriesData, setSeriesData] = useState([]);
  const [datasetError, setDatasetError] = useState(false);
  const [errorDismissed, setErrorDismissed] = useState(false);

  const isDark = theme === "dark";

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const companies = data.data || [];
        const hasRequiredFields = companies.every(
          (c) =>
            typeof c.pe_ttm === "number" &&
            typeof c.roe_ttm === "number" &&
            typeof c.roce_ttm === "number" &&
            typeof c.pb_ttm === "number" &&
            typeof c.eps_ttm === "number"
        );
        if (
          !Array.isArray(companies) ||
          companies.length === 0 ||
          !hasRequiredFields
        ) {
          throw new Error("Invalid radar dataset");
        }
        setSeriesData(buildSeries(companies));
      } catch (err) {
        console.error("Radar dataset error:", err);
        setDatasetError(true);
      } finally {
        setLoading(false);
      }
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  const options = {
    chart: {
      polar: true,
      type: "area",
      backgroundColor: isDark ? "transparent" : "#ffffff",
    },
    title: {
      text: "Bank Sector – Financial Radar",
      style: {
        color: isDark ? "#ffffff" : "black",
        fontWeight: "700",
        fontSize: "18px",
      },
    },
    pane: { size: "80%" },
    credits: { enabled: false },
    xAxis: {
      categories: [
        "pe_ttm",
        "roe_ttm",
        "roce_ttm",
        "pb_ttm",
        "eps_ttm",
        "mcap",
        "facevalue",
        "bookvalue",
      ],
      tickmarkPlacement: "on",
      lineWidth: 0,
      labels: {
        style: { color: isDark ? "#dcdcdc" : "black", fontSize: "12px" },
      },
    },
    yAxis: {
      min: 0.1,
      type: "logarithmic",
      gridLineInterpolation: "polygon",
      lineWidth: 1,
      gridLineColor: isDark ? "#6b6b6b" : "#ccc",
      labels: {
        style: { color: isDark ? "#d0d0d0" : "#333333", fontSize: "11px" },
      },
    },
    legend: {
      align: "right",
      verticalAlign: "top",
      layout: "vertical",
      itemStyle: { color: isDark ? "#eaeaea" : "#222" },
      floating: true,
      x: -140,
      y: 70,
    },
    tooltip: {
      shared: true,
      borderColor: isDark ? "#999" : "#ccc",
      backgroundColor: isDark ? "rgba(20,20,20,0.98)" : "#ffffff",
      style: { color: isDark ? "#ffffff" : "#000000", fontSize: "12px" },
      borderWidth: 1,
      shadow: false,
      pointFormat:
        '<span style="color:{point.color}">●</span> {series.name}: <b>{point.y:.2f}</b><br/>',
    },
    responsive: {
      rules: [
        {
          condition: {
            // Target screens 600 pixels wide or less
            maxWidth: 600,
          },
          chartOptions: {
            // A. Move the legend below the chart area
            legend: {
              align: "center", // Center the legend horizontally
              verticalAlign: "bottom", // Place it at the bottom
              layout: "horizontal", // Stack items horizontally (less space)
              itemMarginTop: 5, // Add a little space between items
              itemStyle: {
                fontSize: "9px", // Optional: Shrink font size for legend items
              },
            },
            // B. Optional: Increase padding around the chart plot area
            chart: {
              spacingLeft: 20,
              spacingRight: 20,
            },
          },
        },
      ],
    },
    plotOptions: {
      series: {
        pointPlacement: "on",
        fillOpacity: 0.9,
        marker: { enabled: true, radius: 3 },
      },
      area: { fillOpacity: 0.3, marker: { enabled: true, radius: 3 } },
    },
    series: seriesData,
  };

  return (
    <div className="radar-chart-container">
      {errorDismissed ? (
        <div className="blank-page"></div>
      ) : datasetError ? (
        <div className={`inline-error-box ${isDark ? "dark" : ""}`}>
          <h3>Data Error</h3>
          <p>Failed to load radar chart.Please try again</p>
          <button onClick={() => window.location.reload()}>Reload</button>
        </div>
      ) : loading ? (
        <div className={`radar-shimmer ${isDark ? "dark" : ""}`}></div>
      ) : (
        <HighchartsReact highcharts={Highcharts} options={options} />
      )}
    </div>
  );
}

export default RadarChart;
