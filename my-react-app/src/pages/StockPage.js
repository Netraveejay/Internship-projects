// src/pages/StockPage.js
import React from "react";
import StockGraph from "../components/stock/StockGraph";
import eventsData from "../data/data (5).json";
import stockData from "../data/data (6).json";

function StockPage({ theme }) {
  return (
    <div className={`page ${theme}`}>
      <h2>Stock Graph</h2>
      <StockGraph theme={theme} eventsData={eventsData} stockData={stockData} />
    </div>
  );
}

export default StockPage;
