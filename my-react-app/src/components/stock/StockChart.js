import { useMemo, useState, useEffect } from "react";
import Highcharts from "highcharts/highstock";
import HighchartsReact from "highcharts-react-official";
import "highcharts/modules/annotations";

import "../../styles/StockChart.css";
import "../../styles/RadarChart.css";

import stockPricesData from "../../data/daily_price_202512181029 (1)_yourgpt.json";
import annotationsData from "../../data/data (5).json";

const StockChart = function (theme) {
  if (theme === undefined) theme = "light";

  const [loading, setLoading] = useState(true);
  const [datasetError, setDatasetError] = useState(false);
  const [errorDismissed, setErrorDismissed] = useState(false);
  const [dataValidated, setDataValidated] = useState(false);

  const isDark = theme === "dark";

  const [showResult, setShowResult] = useState(true);
  const [showDividend, setShowDividend] = useState(true);
  const [showBuyback, setShowBuyback] = useState(true);
  const [showBonus, setShowBonus] = useState(true);

  // ---------------- DATA VALIDATION ----------------
  useEffect(() => {
    let hasError = false;

    try {
      const prices = Array.isArray(stockPricesData)
        ? stockPricesData
        : stockPricesData?.data || [];

      const ann = Array.isArray(annotationsData)
        ? annotationsData
        : annotationsData?.data || [];

      if (!prices.length) hasError = true;

      const validPrice = prices.every(
        (d) => d.trade_date && !isNaN(Number(d.close))
      );

      const validAnn = ann.every((d) => d.date && d.category);

      if (!validPrice || !validAnn) hasError = true;

      setDatasetError(hasError);
    } catch (e) {
      console.error(e);
      setDatasetError(true);
      hasError = true;
    } finally {
      setDataValidated(true);
      if (!hasError) setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (dataValidated && !datasetError) {
      const t = setTimeout(() => setLoading(false), 1200);
      return () => clearTimeout(t);
    }
  }, [
    dataValidated,
    datasetError,
    showResult,
    showDividend,
    showBuyback,
    showBonus,
  ]);

  // ---------------- CHART DATA ----------------
  const chartData = useMemo(() => {
    if (datasetError) return { seriesData: [], annotations: [] };

    const priceData = Array.isArray(stockPricesData)
      ? stockPricesData
      : stockPricesData?.data || [];

    const annoData = Array.isArray(annotationsData)
      ? annotationsData
      : annotationsData?.data || [];

    const seriesData = priceData
      .map((item) => ({
        x: new Date(item.trade_date).getTime(),
        y: Number(item.close),

        ann_category: null,
        ann_divamt: null,
        ann_buyback: null,
        ann_bonusratio: null,
      }))
      .sort((a, b) => a.x - b.x);

    const annotatedPoints = new Set();

    seriesData.forEach((point, idx) => {
      const match = annoData.find(
        (a) => new Date(a.date.split(" ")[0]).getTime() === point.x
      );

      if (match) {
        point.ann_category = match.category;
        point.ann_divamt = match.divamt;
        point.ann_buyback = match.maxbuybackprice;
        point.ann_bonusratio = match.bonusratio;
        annotatedPoints.add(idx);
      }
    });

    const yOffsets = [-35, -60, -85, -110, -135];

    const filteredAnnotations = seriesData
      .filter((d, i) => {
        if (!annotatedPoints.has(i) || !d.ann_category) return false;

        const nothingSelected =
          !showResult && !showDividend && !showBuyback && !showBonus;

        if (nothingSelected) return true;

        if (d.ann_category === "result") return showResult;
        if (d.ann_category === "dividend") return showDividend;
        if (d.ann_category === "buyback") return showBuyback;
        if (d.ann_category === "bonus") return showBonus;

        return false;
      })

      .map((d, index) => {
        let label =
          d.ann_category.charAt(0).toUpperCase() + d.ann_category.slice(1);

        if (d.ann_category === "dividend" && d.ann_divamt)
          label = "Dividend: ₹" + d.ann_divamt;

        if (d.ann_category === "buyback" && d.ann_buyback)
          label = "Buyback: ₹" + d.ann_buyback;

        if (d.ann_category === "bonus" && d.ann_bonusratio)
          label = "Bonus: " + d.ann_bonusratio;

        const colors = {
          result: "#22c55e",
          dividend: "#fbbf24",
          buyback: "#3b82f6",
          bonus: "#a855f7",
        };

        return {
          labels: [
            {
              point: { x: d.x, y: d.y, xAxis: 0, yAxis: 0 },
              text: label,
              backgroundColor: colors[d.ann_category],
              borderColor: colors[d.ann_category],
              borderRadius: 4,
              padding: 6,
              style: {
                color: d.ann_category === "dividend" ? "black" : "white",
                fontSize: "10px",
                fontWeight: "600",
              },
              y: yOffsets[index % yOffsets.length],
              crop: false,
            },
          ],
        };
      });

    return { seriesData, annotations: filteredAnnotations };
  }, [datasetError, showResult, showDividend, showBuyback, showBonus]);

  // ---------------- OPTIONS ----------------
  const options = useMemo(
    () => ({
      chart: {
        type: "areaspline",
        height: 550,
        zoomType: "x",
        backgroundColor: "var(--chart-bg)",
      },
      title: {
        text: "Stock Price Overview",
        style: { color: "var(--chart-text)" },
      },
      xAxis: {
        type: "datetime",
        labels: { style: { color: "var(--chart-text)" } },
        lineColor: "var(--chart-grid)",
        tickColor: "var(--chart-grid)",
        gridLineColor: "var(--chart-grid)",
      },
      yAxis: {
        title: { text: "Price (INR)", style: { color: "var(--chart-text)" } },
        labels: { style: { color: "var(--chart-text)" } },
        gridLineColor: "var(--chart-grid)",
      },
      series: [
        {
          name: "Stock Price",
          data: chartData.seriesData,
          color: "rgba(246, 59, 59, 0.8)",
          fillColor: "hsla(0, 91%, 60%, 0.20)",
        },
      ],
      annotations: chartData.annotations,
      navigator: {
        enabled: true,
        series: { color: "var(--legend-split)" },
        xAxis: { labels: { style: { color: "var(--chart-text)" } } },
      },
      scrollbar: { enabled: true },
      tooltip: {
        backgroundColor: "var(--card)",
        style: { color: "var(--chart-text)" },
        useHTML: true,
        formatter: function () {
          const date = Highcharts.dateFormat("%A, %b %e, %Y", this.x);

          let html = `<b>${date}</b><br/>`;
          html += `● <b>Stock Price:</b> ₹${this.y.toFixed(2)}`;

          if (this.point.ann_category) {
            html += `<br/><br/><b>Event:</b> ${this.point.ann_category.toUpperCase()}`;

            if (
              this.point.ann_category === "dividend" &&
              this.point.ann_divamt
            ) {
              html += `<br/>Dividend: ₹${this.point.ann_divamt}`;
            }

            if (
              this.point.ann_category === "buyback" &&
              this.point.ann_buyback
            ) {
              html += `<br/>Buyback Price: ₹${this.point.ann_buyback}`;
            }

            if (
              this.point.ann_category === "bonus" &&
              this.point.ann_bonusratio
            ) {
              html += `<br/>Bonus Ratio: ${this.point.ann_bonusratio}`;
            }
          }

          return html;
        },
      },
    }),
    [chartData]
  );

  // ---------------- RENDER ----------------
  return (
    <div className="radar-chart-container">
      {datasetError && !errorDismissed ? (
        <div className="inline-error-box">
          <h3>Oops! Data Loading Failed</h3>
          <button onClick={() => window.location.reload()}>Reload</button>
        </div>
      ) : loading ? (
        <div className={"radar-shimmer " + (isDark ? "dark" : "")}></div>
      ) : (
        <>
          <div className="selector-buttons" style={{ marginBottom: "16px" }}>
            <button
              className={"selector-btn " + (showResult ? "active" : "")}
              onClick={() => setShowResult(!showResult)}
            >
              Result
            </button>
            <button
              className={"selector-btn " + (showDividend ? "active" : "")}
              onClick={() => setShowDividend(!showDividend)}
            >
              Dividend
            </button>
            <button
              className={"selector-btn " + (showBuyback ? "active" : "")}
              onClick={() => setShowBuyback(!showBuyback)}
            >
              Buyback
            </button>
            <button
              className={"selector-btn " + (showBonus ? "active" : "")}
              onClick={() => setShowBonus(!showBonus)}
            >
              Bonus
            </button>
          </div>

          <HighchartsReact highcharts={Highcharts} options={options} />
        </>
      )}
    </div>
  );
};

export default StockChart;
