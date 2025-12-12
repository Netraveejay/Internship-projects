import React, { useState, useEffect } from "react";
import eventsData from "../../data/data (2).json";
import { getEventsByDate } from "../../utils/timelineUtils";
import "../../styles/Timeline.css";

const StockTimeline = () => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedEvents, setSelectedEvents] = useState([]);
  const [filterType, setFilterType] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [errorDismissed, setErrorDismissed] = useState(false);
  const [eventsByDate, setEventsByDate] = useState({});

  const loadTimelineData = () => {
    setLoading(true);
    setError(null);

    setTimeout(() => {
      try {
        const parsedData = getEventsByDate(eventsData.data || eventsData);
        if (!parsedData || Object.keys(parsedData).length === 0) {
          throw new Error("Invalid timeline dataset");
        }
        setEventsByDate(parsedData);
        setLoading(false);
      } catch (err) {
        console.error("Error loading timeline:", err);
        setError("Failed to load timeline data. Please try again.");
        setLoading(false);
      }
    }, 1200);
  };

  useEffect(() => {
    loadTimelineData();
  }, []);

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    return `${String(d.getDate()).padStart(2, "0")}-${
      months[d.getMonth()]
    }-${d.getFullYear()}`;
  };

  const handleClick = (dateKey) => {
    const events = eventsByDate[dateKey] || [];
    const filtered =
      filterType === "all"
        ? events
        : filterType === "result"
        ? events.filter((e) => !e.category || e.category === "result")
        : events.filter((e) => e.category === filterType);

    setSelectedDate(dateKey);
    setSelectedEvents(filtered);
  };

  const closePopup = () => {
    setSelectedDate(null);
    setSelectedEvents([]);
  };

  const filteredDates = Object.entries(eventsByDate).filter(([, dayEvents]) => {
    if (filterType === "all") return true;
    return dayEvents.some((e) =>
      filterType === "result"
        ? !e.category || e.category === "result"
        : e.category === filterType
    );
  });

  return (
    <div className="stock-tl-wrapper">
      {error ? (
        <div className="stock-error-box">
          <h3>⚠️ Failed to load timeline data</h3>
          <p>{error}</p>
          <button className="stock-error-reload" onClick={loadTimelineData}>
            Reload Data
          </button>
        </div>
      ) : (
        <>
          {loading ? (
            <div className="shimmer shimmer-title"></div>
          ) : (
            <h2 className="stock-tl-title">Events Timeline</h2>
          )}

          <div className="stock-filter-bar">
            {loading
              ? [...Array(4)].map((_, i) => (
                  <div key={i} className="shimmer shimmer-filter"></div>
                ))
              : ["all", "dividend", "split", "result"].map((cat) => (
                  <button
                    key={cat}
                    className={`stock-filter-btn ${
                      filterType === cat ? "active" : ""
                    }`}
                    onClick={() => setFilterType(cat)}
                  >
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </button>
                ))}
          </div>

          {loading ? (
            <div className="stock-tl-line">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className={`stock-tl-item ${
                    i % 2 === 0 ? "stock-left" : "stock-right"
                  }`}
                >
                  <div className="stock-tl-dot shimmer-dot"></div>
                  <div className="stock-tl-box shimmer-box">
                    <div className="shimmer-date"></div>
                    <div className="shimmer-chip"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="stock-tl-line">
              {filteredDates.map(([date, dayEvents], idx) => {
                const filteredEvent =
                  filterType === "all"
                    ? dayEvents[0]
                    : filterType === "result"
                    ? dayEvents.find(
                        (e) => !e.category || e.category === "result"
                      )
                    : dayEvents.find((e) => e.category === filterType);

                if (!filteredEvent) return null;

                return (
                  <div
                    key={date}
                    className={`stock-tl-item ${
                      idx % 2 === 0 ? "stock-left" : "stock-right"
                    }`}
                  >
                    <div
                      className="stock-tl-dot"
                      style={{
                        backgroundColor:
                          filteredEvent.category === "dividend"
                            ? "#4caf50"
                            : filteredEvent.category === "split"
                            ? "#60a5fa"
                            : "#a78bfa",
                      }}
                    ></div>

                    <div className="stock-tl-box">
                      <div className="stock-tl-date">{formatDate(date)}</div>

                      <div
                        className={`stock-tl-chip ${
                          filteredEvent.category === "dividend"
                            ? "stock-chip-dividend"
                            : filteredEvent.category === "split"
                            ? "stock-chip-split"
                            : "stock-chip-default"
                        }`}
                        onClick={() => handleClick(date)}
                      >
                        {filteredEvent.category === "dividend"
                          ? `Dividend — ₹${filteredEvent.divamt || "-"}`
                          : filteredEvent.category === "split"
                          ? `Split — ${filteredEvent.split || "-"}`
                          : `Result (${dayEvents.length})`}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {selectedDate && (
            <div className="stock-tl-overlay" onClick={closePopup}>
              <div
                className="stock-tl-popup"
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="stock-tl-popup-title">
                  Events on {selectedDate}
                </h3>

                <ul className="stock-tl-popup-list">
                  {selectedEvents.map((ev, i) => (
                    <li key={i}>
                      <div
                        className={`stock-tl-chip-full ${
                          ev.category === "dividend"
                            ? "stock-chip-dividend"
                            : ev.category === "split"
                            ? "stock-chip-split"
                            : "stock-chip-default"
                        }`}
                      >
                        {ev.category === "dividend"
                          ? `Dividend — ₹${ev.divamt || "-"}`
                          : ev.category === "split"
                          ? `Split — ${ev.split || "-"}`
                          : "Result"}
                      </div>

                      {ev.note && (
                        <div className="stock-tl-note">{ev.note}</div>
                      )}
                    </li>
                  ))}
                </ul>

                <button className="stock-tl-close" onClick={closePopup}>
                  Close
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default StockTimeline;
