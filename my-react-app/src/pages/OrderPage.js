import React from "react";
import OrderBook from "../components/orderbook/OrderBook";

function OrderPage({ theme }) {
  return (
    <div className={`page ${theme}`}>
      <h2>Order Book</h2>
      <OrderBook theme={theme} /> {/* pass theme */}
    </div>
  );
}

export default OrderPage;
