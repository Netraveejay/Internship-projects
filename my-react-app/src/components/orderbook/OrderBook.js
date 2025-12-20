import React, { useEffect, useRef, useState, useMemo } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import io from "socket.io-client";
import protobuf from "protobufjs";

const ROW_HEIGHT = 45;
const TOTAL_ROWS = 10;

const STATIC_OPTIONS = {
  chart: {
    type: "bar",
    backgroundColor: "transparent",
    animation: false,
    margin: [0, 0, 0, 0],
    height: ROW_HEIGHT * TOTAL_ROWS,
  },
  title: { text: null },
  xAxis: {
    visible: false,
    categories: [],
  },
  yAxis: {
    visible: false,
    gridLineWidth: 0,
    plotLines: [{ color: "#555", width: 2, value: 0, zIndex: 5 }],
  },
  plotOptions: {
    series: {
      stacking: "normal",
      borderWidth: 0,
      animation: false,
      pointPadding: 0,
      groupPadding: 0,
      dataLabels: {
        enabled: true,
        inside: true,
        formatter: function () {
          return this.point.priceLabel;
        },
        style: {
          textOutline: "none",
          fontSize: "12px",
          fontWeight: "bold",
        },
      },
    },
  },
  // ✅ TOOLTIP CONFIGURED FOR CSS VARIABLE BACKGROUND
  tooltip: {
    enabled: true,
    useHTML: true,
    backgroundColor: "var(--ob-tooltip-bg)",
    borderColor: "var(--ob-border)",
    borderRadius: 6,
    borderWidth: 1,
    shadow: false,
    style: {
      color: "var(--ob-text)",
      fontSize: "12px",
    },
    formatter: function () {
      const side = this.series.name === "Bids" ? "Bid" : "Ask";
      const qty = Math.abs(this.point.quantity).toLocaleString();
      const price = this.point.priceLabel;

      return `
        <div style="padding: 5px; min-width: 80px;">
          <b style="color: ${this.series.color}">${side}</b><br/>
          <span style="opacity: 0.8">Price:</span> <b>${price}</b><br/>
          <span style="opacity: 0.8">Qty:</span> <b>${qty}</b>
        </div>
      `;
    },
  },
  legend: { enabled: false },
  credits: { enabled: false },
  series: [
    { name: "Bids", color: "#1677b9", data: [] },
    { name: "Asks", color: "#d14a4a", data: [] },
  ],
};

const LiveOrderBook = () => {
  const chartRef = useRef(null);
  const socketRef = useRef(null);
  const [rows, setRows] = useState([]);
  const [isPaused, setIsPaused] = useState(false);
  const isPausedRef = useRef(isPaused);
  const [isLoading, setIsLoading] = useState(true);

  const chartOptions = useMemo(() => {
    const isLight = document.body?.classList.contains("light");
    const labelColor = isLight ? "#000000" : "#ffffff";

    return {
      ...STATIC_OPTIONS,
      plotOptions: {
        ...STATIC_OPTIONS.plotOptions,
        series: {
          ...STATIC_OPTIONS.plotOptions.series,
          dataLabels: {
            ...STATIC_OPTIONS.plotOptions.series.dataLabels,
            color: labelColor,
          },
        },
      },
    };
  }, []);

  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

  useEffect(() => {
    socketRef.current = io("http://localhost:4000/orderbook", {
      transports: ["websocket"],
    });

    const socket = socketRef.current;

    if (!document.getElementById("ob-theme-styles")) {
      const s = document.createElement("style");
      s.id = "ob-theme-styles";
      s.innerHTML = `
        :root {
          --ob-bg: #1f2230;
          --ob-text: #ffffff;
          --ob-border: #444444;
          --ob-tooltip-bg:"white";
          --ob-shimmer-base: #2a2f3a;
          --ob-shimmer-highlight: #3a3f48;
        }
        body.light {
          --ob-bg: #ffffff;
          --ob-text: #1f2230;
          --ob-border: #dddddd;
          --ob-tooltip-bg: #ffffff;
          --ob-shimmer-base: #e0e0e0;
          --ob-shimmer-highlight: #f0f0f0;
        }
        @keyframes ob-rect-shimmer { 0% { background-position: -250px 0 } 100% { background-position: 250px 0 } }
        .ob-rect-shimmer { background: linear-gradient(90deg, var(--ob-shimmer-base) 25%, var(--ob-shimmer-highlight) 50%, var(--ob-shimmer-base) 75%); background-size: 500px 100%; animation: ob-rect-shimmer 1.2s linear infinite; }
        .ob-rect-shimmer.fixed { border-radius: 6px; }
      `;
      document.head.appendChild(s);
    }

    protobuf.load("/proto/orderbook.proto").then((root) => {
      const OrderBookType = root.lookupType("OrderBook");
      socket.on("orderbookData", (buffer) => {
        if (isPausedRef.current) return;
        if (isLoading) setIsLoading(false);
        if (!chartRef.current?.chart) return;

        const u8 =
          buffer instanceof ArrayBuffer
            ? new Uint8Array(buffer)
            : new Uint8Array(buffer.data || buffer);
        const decoded = OrderBookType.decode(u8);

        const sortedBids = (decoded.bids || [])
          .sort((a, b) => b.price - a.price)
          .slice(0, TOTAL_ROWS);
        const sortedAsks = (decoded.asks || [])
          .sort((a, b) => a.price - b.price)
          .slice(0, TOTAL_ROWS);

        const bidSeriesData = [];
        const askSeriesData = [];
        const newCategories = [];
        const tableRows = [];

        for (let i = 0; i < TOTAL_ROWS; i++) {
          const b = sortedBids[i] || { price: 0, quantity: 0 };
          const a = sortedAsks[i] || { price: 0, quantity: 0 };

          bidSeriesData.push({
            y: -b.quantity,
            priceLabel:
              b.price > 0
                ? b.price.toLocaleString()
                : a.price > 0
                ? a.price.toLocaleString()
                : "",
            quantity: b.quantity,
            id: `bid_${i}`,
          });

          askSeriesData.push({
            y: a.quantity,
            priceLabel:
              a.price > 0
                ? a.price.toLocaleString()
                : b.price > 0
                ? b.price.toLocaleString()
                : "",
            quantity: a.quantity,
            id: `ask_${i}`,
          });

          const catLabel =
            b.price > 0
              ? b.price.toLocaleString()
              : a.price > 0
              ? a.price.toLocaleString()
              : "";
          newCategories.push(catLabel);
          tableRows.push({ bidQty: b.quantity, askQty: a.quantity });
        }

        setRows(tableRows);
        const chart = chartRef.current.chart;
        const maxBidVolume = Math.max(
          ...bidSeriesData.map((d) => Math.abs(d.y)),
          1
        );
        const maxAskVolume = Math.max(
          ...askSeriesData.map((d) => Math.abs(d.y)),
          1
        );
        const visualMax = Math.max(maxBidVolume, maxAskVolume);

        chart.yAxis[0].setExtremes(-visualMax, visualMax, false);
        chart.xAxis[0].setCategories(newCategories, false);
        chart.series[0].setData(bidSeriesData, false, false, true);
        chart.series[1].setData(askSeriesData, false, false, true);
        chart.redraw(false);
      });
    });

    return () => socket.disconnect();
  }, [isLoading]);

  return (
    <div
      style={{
        backgroundColor: "var(--ob-bg)",
        padding: "20px",
        color: "var(--ob-text)",
        fontFamily: "sans-serif",
        transition: "background 0.2s ease",
      }}
    >
      <div style={{ marginBottom: "20px", textAlign: "center" }}>
        <button
          onClick={() => setIsPaused(!isPaused)}
          style={{
            padding: "10px 24px",
            backgroundColor: isPaused ? "#16b94e" : "#d14a4a",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontWeight: "bold",
            fontSize: "14px",
          }}
        >
          {isPaused ? "START ANIMATION" : "STOP ANIMATION"}
        </button>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "100px 1fr 100px",
          marginBottom: "10px",
          textAlign: "center",
          borderBottom: "1px solid var(--ob-border)",
          paddingBottom: "10px",
        }}
      >
        <div
          style={{ color: "var(--ob-text)", opacity: 0.6, fontSize: "12px" }}
        >
          Bids
        </div>
        <div style={{ color: "var(--ob-text)", fontWeight: "bold" }}>
          Price ($)
        </div>
        <div
          style={{ color: "var(--ob-text)", opacity: 0.6, fontSize: "12px" }}
        >
          Asks
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "100px 1fr 100px",
          height: `${ROW_HEIGHT * TOTAL_ROWS}px`,
        }}
      >
        <div>
          {isLoading
            ? new Array(TOTAL_ROWS)
                .fill(0)
                .map((_, i) => (
                  <div
                    key={i}
                    className="ob-rect-shimmer"
                    style={{ height: ROW_HEIGHT - 6, margin: 3 }}
                  />
                ))
            : rows.map((r, i) => (
                <div
                  key={i}
                  style={{
                    height: ROW_HEIGHT,
                    display: "flex",
                    alignItems: "center",
                    color: "#1677b9",
                    fontWeight: "bold",
                  }}
                >
                  {r.bidQty > 0 ? r.bidQty.toLocaleString() : ""}
                </div>
              ))}
        </div>
        <div style={{ width: "100%" }}>
          {isLoading ? (
            <div
              style={{
                height: ROW_HEIGHT * TOTAL_ROWS,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              {new Array(TOTAL_ROWS).fill(0).map((_, i) => (
                <div
                  key={i}
                  className="ob-rect-shimmer fixed"
                  style={{ height: ROW_HEIGHT - 8, margin: "4px 40px" }}
                />
              ))}
            </div>
          ) : (
            <HighchartsReact
              highcharts={Highcharts}
              options={chartOptions}
              ref={chartRef}
            />
          )}
        </div>
        <div>
          {isLoading
            ? new Array(TOTAL_ROWS)
                .fill(0)
                .map((_, i) => (
                  <div
                    key={i}
                    className="ob-rect-shimmer"
                    style={{ height: ROW_HEIGHT - 6, margin: 3 }}
                  />
                ))
            : rows.map((r, i) => (
                <div
                  key={i}
                  style={{
                    height: ROW_HEIGHT,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "flex-end",
                    color: "#d14a4a",
                    fontWeight: "bold",
                  }}
                >
                  {r.askQty > 0 ? r.askQty.toLocaleString() : ""}
                </div>
              ))}
        </div>
      </div>
    </div>
  );
};

export default LiveOrderBook;
