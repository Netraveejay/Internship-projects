import React, { useEffect, useRef, useState } from "react";
import Highcharts from "highcharts/highstock";
import HighchartsReact from "highcharts-react-official";
import io from "socket.io-client";
import "../../styles/LiveChart.css";

const socket = io("http://localhost:4000");
const companiesList = ["All", "AAPL", "GOOGL", "MSFT"];

const LiveChart = () => {
  const chartRef = useRef(null);
  const [selectedCompany, setSelectedCompany] = useState("AAPL");
  const [loading, setLoading] = useState(true);
  const [dataError, setDataError] = useState(false);
  const [errorDismissed, setErrorDismissed] = useState(false);
  const [chartReady, setChartReady] = useState(false);

  // Update chart whenever new data arrives
  useEffect(() => {
    const updateChart = (companies) => {
      if (!Array.isArray(companies) || companies.length === 0) {
        setDataError(true);
        setLoading(false);
        return;
      }

      // Wait until chart is ready
      if (!chartReady || !chartRef.current?.chart) return;

      const chart = chartRef.current.chart;
      const now = Date.now();

      setDataError(false);
      setLoading(false);

      if (selectedCompany === "All") {
        companies.forEach((company, i) => {
          if (!chart.series[i]) {
            chart.addSeries(
              {
                name: company.code,
                type: "spline",
                data: [[now, company.price]],
                lineWidth: 2,
                marker: { enabled: false },
                yAxis: i,
              },
              false
            );
          } else {
            chart.series[i].addPoint([now, company.price], false);
          }
        });

        while (chart.series.length > companies.length) {
          chart.series[chart.series.length - 1].remove(false);
        }
      } else {
        const company = companies.find((c) => c.code === selectedCompany);
        if (!company) return;

        if (!chart.series[0]) {
          chart.addSeries(
            {
              name: selectedCompany,
              type: "spline",
              data: [[now, company.price]],
              lineWidth: 2,
              marker: { enabled: false },
            },
            false
          );
        } else {
          chart.series[0].addPoint([now, company.price], false);
        }

        while (chart.series.length > 1) chart.series[1].remove(false);
      }

      chart.xAxis[0].setExtremes(now - 30000, now, false, false);
      chart.redraw();
    };

    socket.on("update", updateChart);
    return () => socket.off("update", updateChart);
  }, [selectedCompany, chartReady]);

  const options = {
    chart: {
      backgroundColor: "transparent",
      style: { fontFamily: "Inter, Arial, sans-serif" },
    },
    title: {
      text: `Live Stock Prices: ${selectedCompany}`,
      style: { color: "var(--text-color)" },
    },
    xAxis: {
      type: "datetime",
      labels: { style: { color: "var(--text-color)" } },
      gridLineColor: "var(--border-color)",
    },
    yAxis:
      selectedCompany === "All"
        ? [
            { title: { text: "AAPL" } },
            { title: { text: "GOOGL" }, opposite: true },
            { title: { text: "MSFT" }, opposite: true },
          ]
        : {
            title: { text: "Price" },
            labels: { style: { color: "var(--text-color)" } },
          },
    tooltip: {
      split: false,
      backgroundColor: "var(--tooltip-bg)",
      borderColor: "var(--tooltip-border)",
      style: { color: "var(--tooltip-text)", fontWeight: "600" },
      valueDecimals: 2,
    },
    rangeSelector: { enabled: false },
    navigator: { enabled: false },
    scrollbar: { enabled: true },
    credits: { enabled: false },
    series: [],
  };

  // Error box
  if (dataError) {
    return (
      <div className="live-chart-wrapper">
        {!errorDismissed && (
          <div className="inline-error-box">
            <strong>Data Error</strong>
            <p>Failed to load live chart. Please try again.</p>
            <button
              className="reload-btn"
              onClick={() => window.location.reload()}
            >
              Reload
            </button>
            <button
              className="dismiss-btn"
              onClick={() => setErrorDismissed(true)}
            >
              Dismiss
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="live-chart-wrapper">
      {/* COMPANY FILTER */}
      <div className="company-buttons">
        {companiesList.map((c) => (
          <button
            key={c}
            className={c === selectedCompany ? "active" : ""}
            onClick={() => {
              setSelectedCompany(c);
              if (chartRef.current?.chart) {
                chartRef.current.chart.series.forEach((s) => s.setData([]));
              }
              setLoading(true); // show shimmer until new data arrives
            }}
          >
            {c}
          </button>
        ))}
      </div>

      {/* CHART */}
      <div className="chart-card">
        {loading && <div className="chart-shimmer" />}
        <HighchartsReact
          highcharts={Highcharts}
          constructorType="stockChart"
          options={options}
          ref={chartRef}
          callback={() => setChartReady(true)}
        />
      </div>
    </div>
  );
};

export default LiveChart;
