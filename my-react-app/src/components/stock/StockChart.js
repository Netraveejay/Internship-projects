import { useMemo, useState, useEffect, useRef, useCallback } from "react";
import Highcharts from "highcharts/highstock";
import HighchartsReact from "highcharts-react-official";
// Import the Highcharts Annotations module
import "highcharts/modules/annotations";

// 1. IMPORT THE LIBRARY HOOK
import { useVirtualizer } from "@tanstack/react-virtual";

// Assuming these styles are needed for the component's appearance
import "../../styles/StockChart.css";
import "../../styles/RadarChart.css";

// Assuming these are your data files
import stockPricesData from "../../data/data_stockPrices.json";
import annotationsData from "../../data/data_annotations.json";

const StockChart = function (theme) {
  if (theme === undefined) theme = "light";
  const [selectedCompany, setSelectedCompany] = useState("all");

  const [loading, setLoading] = useState(true);
  const [datasetError, setDatasetError] = useState(false);
  const [errorDismissed, setErrorDismissed] = useState(false);
  const [dataValidated, setDataValidated] = useState(false); // New state to manage validation timing

  const isDark = theme === "dark";

  const [showResult, setShowResult] = useState(true);
  const [showDividend, setShowDividend] = useState(true);
  const [showSplit, setShowSplit] = useState(true);

  // VIRTUALIZATION CONSTANTS
  const itemHeight = 30; // Height of each row in pixels
  const listHeight = 300; // Fixed height of the dropdown container (Visible area)

  // ... (Existing useEffects for data validation and loading) ...

  useEffect(function () {
    let hasError = false;
    try {
      var prices = stockPricesData && stockPricesData.data;
      var ann = annotationsData && annotationsData.data;

      if (!prices || !ann) {
        hasError = true;
      } else if (!Array.isArray(prices) || !Array.isArray(ann)) {
        hasError = true;
      } else {
        var validPrice = prices.every(function (d) {
          return d && d.company_code && d.date && d.price !== undefined;
        });
        var validAnn = ann.every(function (d) {
          return d && d.company_code && d.date && d.category;
        });

        if (!validPrice || !validAnn) {
          hasError = true;
        }
      }

      setDatasetError(hasError);
    } catch (err) {
      console.error("Dataset error:", err);
      setDatasetError(true);
      hasError = true;
    } finally {
      setDataValidated(true);
      if (!hasError) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    if (dataValidated && !datasetError) {
      var timer = setTimeout(function () {
        setLoading(false);
      }, 1200);
      return function () {
        clearTimeout(timer);
      };
    }
  }, [
    dataValidated,
    datasetError,
    selectedCompany,
    showResult,
    showDividend,
    showSplit,
  ]);

  var companies = useMemo(
    function () {
      if (datasetError) return [];
      var pricesArr = (stockPricesData && stockPricesData.data) || [];
      var codes = Array.from(
        new Set(
          pricesArr.map(function (d) {
            return d.company_code;
          })
        )
      );
      return codes.filter(Boolean).sort();
    },
    [datasetError]
  );
  const allCompanies = useMemo(() => ["all", ...companies], [companies]);

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const listRef = useRef(null);

  var toggleDropdown = function () {
    setDropdownOpen(!dropdownOpen);
  };

  var handleClickOutside = function (e) {
    if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
      setDropdownOpen(false);
    }
  };

  useEffect(function () {
    document.addEventListener("click", handleClickOutside);
    return function () {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  // 3. INITIALIZE useVirtualizer
  const rowVirtualizer = useVirtualizer({
    count: allCompanies.length,
    getScrollElement: () => listRef.current,
    estimateSize: useCallback(() => itemHeight, []),
    overscan: 5,
  });

  const virtualRows = rowVirtualizer.getVirtualItems();

  // ... (Existing chartData and options useMemo blocks) ...
  // --- Chart Data Calculation (Memoized) ---
  var chartData = useMemo(
    function () {
      if (datasetError) return { seriesData: [], annotations: [] };

      var priceData = (stockPricesData && stockPricesData.data) || [];
      var annoData = (annotationsData && annotationsData.data) || [];

      if (selectedCompany !== "all") {
        priceData = priceData.filter(function (d) {
          return d.company_code === selectedCompany;
        });
        annoData = annoData.filter(function (d) {
          return d.company_code === selectedCompany;
        });
      }

      var annotationsByCompany = new Map();
      annoData.forEach(function (ann) {
        var existing = annotationsByCompany.get(ann.company_code) || [];
        existing.push(ann);
        annotationsByCompany.set(ann.company_code, existing);
      });

      var seriesData = priceData
        .map(function (item) {
          return {
            x: new Date(item.date).getTime(),
            y: Number(item.price),
            company: item.company_code,
            annotation: null,
          };
        })
        .sort(function (a, b) {
          return a.x - b.x;
        });

      var annotatedPoints = new Set();

      seriesData.forEach(function (point, index) {
        var companyAnnotations = annotationsByCompany.get(point.company) || [];
        var matchingAnn = companyAnnotations.find(function (ann) {
          return new Date(ann.date).getTime() === point.x;
        });
        if (matchingAnn) {
          point.annotation = matchingAnn;
          annotatedPoints.add(index);
        }
      });

      var filteredAnnotations = seriesData
        .filter(function (d, index) {
          if (!annotatedPoints.has(index) || !d.annotation) return false;
          var category = d.annotation.category;
          if (!showResult && !showDividend && !showSplit) return true;
          if (category === "result" && showResult) return true;
          if (category === "dividend" && showDividend) return true;
          if (category === "split" && showSplit) return true;
          return false;
        })
        .map(function (d, index) {
          var ann = d.annotation;
          var category = ann.category;
          var labelText = category.charAt(0).toUpperCase() + category.slice(1);
          if (category === "dividend" && ann.divamt)
            labelText = "Dividend: ₹" + ann.divamt;
          if (category === "split" && ann.splitval)
            labelText = "Split: " + ann.splitval;

          var colors = {
            result: "#22c55e",
            dividend: "#fbbf24",
            split: "#3b82f6",
          };
          var yOffsets = [-35, -60, -85, -110, -135];
          var yOffset = yOffsets[index % yOffsets.length];

          return {
            labels: [
              {
                point: { x: d.x, y: d.y, xAxis: 0, yAxis: 0 },
                text: d.company + ": " + labelText,
                backgroundColor: colors[category],
                borderColor: colors[category],
                borderRadius: 4,
                padding: 6,
                style: {
                  color: category === "dividend" ? "black" : "white",
                  fontSize: "10px",
                  fontWeight: "600",
                },
                y: yOffset,
                overflow: "none",
                crop: false,
              },
            ],
            labelOptions: {
              shape: "connector",
              align: "center",
              verticalAlign: "top",
              distance: 15,
            },
          };
        });

      return { seriesData: seriesData, annotations: filteredAnnotations };
    },
    [selectedCompany, showResult, showDividend, showSplit, datasetError]
  );

  var options = {
    // ... (Highcharts options remain the same) ...
    chart: {
      type: "areaspline",
      backgroundColor: "var(--chart-bg)",
      style: { fontFamily: "Inter, sans-serif" },
      height: 550,
      zoomType: "x",
    },
    title: {
      text:
        selectedCompany === "all"
          ? "Stock Price Overview"
          : selectedCompany + " Stock Price",
      style: {
        color: "var(--chart-text)",
        fontSize: "24px",
        fontWeight: "600",
      },
    },
    subtitle: {
      text: "Click and drag to zoom • Annotations filtered by category",
      style: { color: "var(--chart-text)", fontSize: "13px" },
    },
    xAxis: {
      type: "datetime",
      labels: {
        style: { color: "var(--chart-text)", fontSize: "11px" },
      },
      lineColor: "var(--chart-grid)",
      tickColor: "var(--chart-grid)",
      gridLineColor: "var(--chart-grid)",
      gridLineWidth: 1,
    },
    yAxis: {
      title: { text: "Price (INR)", style: { color: "var(--chart-text)" } },
      labels: { style: { color: "var(--chart-text)" }, format: "{value} INR" },
      gridLineColor: "var(--chart-grid)",
      min: 50,
    },
    tooltip: {
      backgroundColor: "var(--chart-bg)",
      borderColor: "var(--chart-grid)",
      borderRadius: 8,
      style: { color: "var(--chart-text)", fontSize: "13px" },
      formatter: function () {
        var point = this.point;
        var html =
          "<b>" + Highcharts.dateFormat("%B %d, %Y", this.x) + "</b><br/>";
        html +=
          "<span style='color:#e63946'>●</span> Price: <b>" +
          this.y +
          " INR</b>";
        if (point.annotation) {
          var ann = point.annotation;
          var color =
            ann.category === "result"
              ? "#22c55e"
              : ann.category === "dividend"
              ? "#fbbf24"
              : "#3b82f6";
          html +=
            "<br/><br/><span style='color:" +
            color +
            "'>■</span> <b>" +
            ann.category.toUpperCase() +
            "</b>";
          if (ann.note) {
            html +=
              "<br/><span style='font-size:11px;color:#aaa'>" +
              ann.note +
              "</span>";
          }
        }
        return html;
      },
    },
    legend: { enabled: false },
    series: [
      {
        name: "Stock Price",
        type: "areaspline",
        color: "#e63946",
        data: chartData.seriesData,
        fillColor: {
          linearGradient: [0, 0, 0, 300],
          stops: [
            [0, Highcharts.color("#e63946").setOpacity(0.5).get("rgba")],
            [1, Highcharts.color("#e63946").setOpacity(0).get("rgba")],
          ],
        },
        marker: {
          enabled: false,
        },
      },
    ],
    annotations: chartData.annotations,
  };

  // --- Component Render ---
  return (
    <div className="radar-chart-container">
      {/* ... (Error and Loading states remain the same) ... */}
      {datasetError && !errorDismissed ? (
        <div className="inline-error-box">
          <h3>Oops! Data Loading Failed </h3>
          <p>Your dataset has missing or invalid fields.</p>
          <button
            onClick={function () {
              window.location.reload();
            }}
          >
            Reload
          </button>
        </div>
      ) : loading ? (
        <div className={"radar-shimmer " + (isDark ? "dark" : "")}></div>
      ) : (
        <>
          <div className="company-selector">
            <div className="selector-buttons" style={{ marginBottom: "20px" }}>
              <button
                onClick={function () {
                  setShowResult(!showResult);
                }}
                className={"selector-btn " + (showResult ? "active" : "")}
              >
                Result
              </button>
              <button
                onClick={function () {
                  setShowDividend(!showDividend);
                }}
                className={"selector-btn " + (showDividend ? "active" : "")}
              >
                Dividend
              </button>
              <button
                onClick={function () {
                  setShowSplit(!showSplit);
                }}
                className={"selector-btn " + (showSplit ? "active" : "")}
              >
                Split
              </button>
            </div>

            {/* Virtualized Dropdown - FIXED STYLES */}
            <div
              className="dropdown-container"
              ref={dropdownRef}
              style={{ position: "relative", width: "200px" }}
            >
              <div
                className="dropdown-selected"
                onClick={toggleDropdown}
                style={{
                  border: "1px solid var(--chart-grid)",
                  borderRadius: "4px",
                  padding: "6px 8px",
                  cursor: "pointer",
                  backgroundColor: "var(--chart-bg)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  color: "var(--ann-text-color)",
                }}
              >
                {selectedCompany === "all"
                  ? "Choose a Company "
                  : selectedCompany}
                <span className={`arrow ${dropdownOpen ? "open" : ""}`}></span>
              </div>

              {dropdownOpen && (
                <div
                  className="dropdown-list-wrapper"
                  // 4. Assign the scroll container ref here
                  ref={listRef}
                  style={{
                    position: "absolute",
                    top: "100%",
                    left: 0,
                    right: 0,
                    maxHeight: listHeight + "px",
                    overflowY: "auto",
                    border: "1px solid var(--chart-grid)",
                    borderRadius: "4px",
                    backgroundColor: "var(--chart-bg)",
                    zIndex: 10,
                  }}
                >
                  <div
                    // 5. Use Virtualizer's total size for the inner wrapper
                    style={{
                      height: rowVirtualizer.getTotalSize(),
                      width: "100%",
                      position: "relative", // IMPORTANT: For absolute children
                    }}
                  >
                    {
                      // 6. Map over virtual rows instead of the entire array
                      virtualRows.map((virtualRow) => {
                        const index = virtualRow.index;
                        const code = allCompanies[index];
                        const isAll = code === "all";
                        const displayCode = isAll ? "All" : code;

                        return (
                          <div
                            key={virtualRow.key}
                            data-index={index}
                            // 7. Apply absolute positioning and transform
                            style={{
                              position: "absolute", // CRITICAL FIX: Add absolute positioning
                              top: 0,
                              left: 0,
                              width: "100%",
                              height: virtualRow.size, // CRITICAL FIX: Use virtualRow.size
                              // Use the virtualRow.start position
                              transform: `translateY(${virtualRow.start}px)`,
                              // Existing visual styles:
                              padding: "0 8px",
                              cursor: "pointer",
                              lineHeight: itemHeight + "px",
                              background:
                                (isAll && selectedCompany === "all") ||
                                (!isAll && selectedCompany === code)
                                  ? "var(--chart-highlight)"
                                  : "transparent",
                              color: "var(--ann-text-color)",
                            }}
                            onClick={() => {
                              setSelectedCompany(isAll ? "all" : code);
                              setDropdownOpen(false);
                            }}
                          >
                            {displayCode}
                          </div>
                        );
                      })
                    }
                  </div>
                </div>
              )}
            </div>

            {/* Standard Dropdown (for comparison) */}
            <div
              className="normal-dropdown-container"
              style={{
                position: "relative",
                width: "200px",
                marginLeft: "20px",
              }}
            >
              <select
                className="normal-dropdown-select"
                value={selectedCompany}
                onChange={(e) => setSelectedCompany(e.target.value)}
                style={{
                  width: "100%",
                  padding: "6px 8px",
                  borderRadius: "4px",
                  border: "1px solid var(--chart-grid)",
                  backgroundColor: "var(--chart-bg)",
                  cursor: "pointer",
                  color: "var(--ann-text-color)",
                }}
              >
                <option value="all">Choose a Company (Standard)</option>
                {companies.map((code) => (
                  <option key={code} value={code}>
                    {code}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Legend for Annotations */}
          <div className="legend">
            <div
              className={"legend-item " + (showResult ? "active" : "")}
              onClick={function () {
                setShowResult(!showResult);
              }}
            >
              <span className="legend-dot result"></span>Result
            </div>
            <div
              className={"legend-item " + (showDividend ? "active" : "")}
              onClick={function () {
                setShowDividend(!showDividend);
              }}
            >
              <span className="legend-dot dividend"></span>
              Dividend
            </div>
            <div
              className={"legend-item " + (showSplit ? "active" : "")}
              onClick={function () {
                setShowSplit(!showSplit);
              }}
            >
              <span className="legend-dot split"></span>Split
            </div>
          </div>

          {/* Highcharts Chart */}
          <div className="chart-container">
            <HighchartsReact highcharts={Highcharts} options={options} />
          </div>
        </>
      )}
    </div>
  );
};

export default StockChart;
