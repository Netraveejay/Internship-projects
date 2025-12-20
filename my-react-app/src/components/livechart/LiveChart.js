import React, { useEffect, useRef, useState } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import io from "socket.io-client";
import protobuf from "protobufjs";

const ROW_HEIGHT = 45;
const TOTAL_ROWS = 10;

const STATIC_OPTIONS = {
  chart: {
    type: "bar",
    backgroundColor: "#1f2230",
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
        color: "#ffffff",
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
  tooltip: {
    enabled: true,
    backgroundColor: "#0f111a",
    borderColor: "#444",
    borderRadius: 6,
    style: {
      color: "#fff",
      fontSize: "12px",
    },
    formatter: function () {
      const side = this.series.name === "Bids" ? "Bid" : "Ask";
      return `
        <b>${side}</b><br/>
        Price: <b>${this.point.priceLabel}</b>
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
  const [isLoading, setIsLoading] = useState(true);

  // ✅ SAME ERROR STATES AS LIVECHART
  const [dataError, setDataError] = useState(false);
  const [errorDismissed, setErrorDismissed] = useState(false);

  const isPausedRef = useRef(isPaused);

  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

  useEffect(() => {
    socketRef.current = io("http://localhost:4000/orderbook", {
      transports: ["websocket"],
    });

    const socket = socketRef.current;

    // ✅ SOCKET ERROR HANDLING
    socket.on("connect_error", () => {
      setDataError(true);
      setIsLoading(false);
    });

    protobuf
      .load("/proto/orderbook.proto")
      .then((root) => {
        const OrderBookType = root.lookupType("OrderBook");

        socket.on("orderbookData", (buffer) => {
          if (isPausedRef.current) return;
          if (!chartRef.current?.chart) return;

          const decoded = OrderBookType.decode(new Uint8Array(buffer));

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

          const frameId = Date.now();

          for (let i = 0; i < TOTAL_ROWS; i++) {
            const b = sortedBids[i] || { price: 0, quantity: 0 };
            const a = sortedAsks[i] || { price: 0, quantity: 0 };

            bidSeriesData.push({
              y: -b.quantity,
              priceLabel: b.price ? b.price.toLocaleString() : "",
              id: `bid_${i}_${frameId}`,
            });

            askSeriesData.push({
              y: a.quantity,
              priceLabel: a.price ? a.price.toLocaleString() : "",
              id: `ask_${i}_${frameId}`,
            });

            newCategories.push(`row-${i}-${frameId}`);
            tableRows.push({ bidQty: b.quantity, askQty: a.quantity });
          }

          setRows(tableRows);
          setIsLoading(false);

          const chart = chartRef.current.chart;

          const maxBid = Math.max(
            ...bidSeriesData.map((d) => Math.abs(d.y)),
            1
          );
          const maxAsk = Math.max(
            ...askSeriesData.map((d) => Math.abs(d.y)),
            1
          );
          const visualMax = Math.max(maxBid, maxAsk);

          chart.yAxis[0].setExtremes(-visualMax, visualMax, false);
          chart.xAxis[0].setCategories(newCategories, false);
          chart.series[0].setData(bidSeriesData, false);
          chart.series[1].setData(askSeriesData, false);
          chart.redraw(false);
        });
      })
      .catch(() => {
        // ✅ PROTO ERROR HANDLING
        setDataError(true);
        setIsLoading(false);
      });

    return () => socket.disconnect();
  }, []);

  /* ---------------- ERROR STATE (SAME AS LIVECHART) ---------------- */
  if (dataError) {
    return (
      <div className="live-chart-wrapper">
        {!errorDismissed && (
          <div className="inline-error-box">
            <strong>Data Error</strong>
            <p>Failed to load live orderbook.</p>
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

  /* ---------------- UI (UNCHANGED) ---------------- */
  return (
    <div
      style={{
        backgroundColor: "#1f2230",
        padding: "20px",
        color: "white",
        fontFamily: "sans-serif",
      }}
    >
      <div
        style={{
          marginBottom: "20px",
          display: "flex",
          justifyContent: "flex-end",
        }}
      >
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

      <HighchartsReact
        highcharts={Highcharts}
        options={STATIC_OPTIONS}
        ref={chartRef}
      />
    </div>
  );
};

export default LiveOrderBook;
