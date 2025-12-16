import React, { useState, useMemo, useEffect, useRef } from "react";
import Calendar from "react-calendar";
import eventsData from "../../data/data (2).json";
import { getEventsByDate } from "../../utils/calendarUtils";
import CustomSelect from "../../components/calendar/CustomSelect";
import "../../styles/CustomCalendar.css";
import ErrorModal from "../ErrorModal";

function CustomCalendar() {
  const today = new Date();
  const [value, setValue] = useState(today);
  const [activeStartDate, setActiveStartDate] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1)
  );

  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [popupEvents, setPopupEvents] = useState([]);

  const [fullscreenTimeline, setFullscreenTimeline] = useState(false);
  const [timelineFilter, setTimelineFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [datasetError, setDatasetError] = useState(false);
  const [errorDismissed, setErrorDismissed] = useState(false);

  const eventsByDate = useMemo(() => {
    try {
      const parsed = getEventsByDate(eventsData.data || eventsData);
      return parsed;
    } catch (err) {
      console.error("Dataset error:", err);
      setDatasetError(true);
      return {};
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  const handleReload = () => {
    window.location.reload();
  };

  const handleDayClick = (date) => setValue(date);

  const tileContent = ({ date }) => {
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
      2,
      "0"
    )}-${String(date.getDate()).padStart(2, "0")}`;

    const events = eventsByDate[key] || [];
    if (!events.length) return null;

    const count = {
      dividend: events.filter((e) => e.category === "dividend").length,
      split: events.filter((e) => e.category === "split").length,
      result: events.filter((e) => !e.category || e.category === "result")
        .length,
    };

    return (
      <ul className="event-list">
        {Object.entries(count).map(
          ([cat, n]) =>
            n > 0 && (
              <li
                key={cat}
                className={`event-pill ${
                  cat === "dividend"
                    ? "pill-dividend"
                    : cat === "split"
                    ? "pill-split"
                    : "pill-default"
                }`}
                title={`${cat} (${n})`}
                onClick={() => handlePillClick(key, cat)}
              >
                {cat.charAt(0).toUpperCase() + cat.slice(1)}({n})
              </li>
            )
        )}
      </ul>
    );
  };

  const tileClassName = ({ date }) =>
    date.toDateString() === today.toDateString() ? "today-badge" : "";

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const currentMonth = activeStartDate.getMonth();
  const currentYear = activeStartDate.getFullYear();
  const changeMonth = (m) => setActiveStartDate(new Date(currentYear, m, 1));
  const changeYear = (y) => setActiveStartDate(new Date(y, currentMonth, 1));
  const prevMonth = () =>
    setActiveStartDate(new Date(currentYear, currentMonth - 1, 1));
  const nextMonth = () =>
    setActiveStartDate(new Date(currentYear, currentMonth + 1, 1));
  const years = Array.from({ length: 16 }, (_, i) => 2010 + i);

  const allTimelineEvents = useMemo(() => {
    return Object.entries(eventsByDate).map(([date, events]) => {
      const d = new Date(date);
      const key = d.toISOString().split("T")[0];
      return { date: key, events };
    });
  }, [eventsByDate]);

  const handlePillClick = (date, category) => {
    const events = (eventsByDate[date] || []).filter((e) =>
      category === "result"
        ? !e.category || e.category === "result"
        : e.category === category
    );
    setSelectedDate(date);
    setSelectedCategory(category);
    setPopupEvents(events);
  };

  const closePopup = () => {
    setSelectedDate(null);
    setSelectedCategory(null);
    setPopupEvents([]);
  };

  const Timeline = ({ activeMonth, activeYear }) => {
    const monthNames = [
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
    const itemRefs = useRef({});

    useEffect(() => {
      const firstEventKey = allTimelineEvents.find((ev) => {
        const d = new Date(ev.date);
        return d.getMonth() === activeMonth && d.getFullYear() === activeYear;
      })?.date;

      if (firstEventKey && itemRefs.current[firstEventKey]) {
        itemRefs.current[firstEventKey].scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
    }, [activeMonth, activeYear]);

    return (
      <div className="cal-tl-wrapper">
        <div className="timeline-filters">
          {["all", "dividend", "split", "result"].map((cat) => (
            <button
              key={cat}
              onClick={() => setTimelineFilter(cat)}
              className={timelineFilter === cat ? "active-filter" : ""}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>

        <div className="cal-tl-line">
          {allTimelineEvents
            .filter((ev) => {
              if (timelineFilter === "all") return true;
              const filteredEvents = ev.events.filter((e) =>
                timelineFilter === "default"
                  ? !e.category || e.category === "result"
                  : e.category === timelineFilter
              );
              return filteredEvents.length > 0;
            })
            .map((ev, i) => {
              const d = new Date(ev.date);
              const formattedDate = `${String(d.getDate()).padStart(2, "0")}-${
                monthNames[d.getMonth()]
              }-${d.getFullYear()}`;
              const sideClass = i % 2 === 0 ? "cal-left" : "cal-right";

              const filteredEvents =
                timelineFilter === "all"
                  ? ev.events
                  : ev.events.filter((e) =>
                      timelineFilter === "default"
                        ? !e.category || e.category === "result"
                        : e.category === timelineFilter
                    );

              const count = {
                dividend: filteredEvents.filter(
                  (e) => e.category === "dividend"
                ).length,
                split: filteredEvents.filter((e) => e.category === "split")
                  .length,
                result: filteredEvents.filter(
                  (e) => !e.category || e.category === "result"
                ).length,
              };

              return (
                <div
                  key={i}
                  ref={(el) => (itemRefs.current[ev.date] = el)}
                  className={`cal-tl-item ${sideClass} ${
                    d.getMonth() === activeMonth &&
                    d.getFullYear() === activeYear
                      ? "highlight-month"
                      : ""
                  }`}
                  onClick={() => {
                    // 📌 CLICK BOX NAVIGATES CALENDAR
                    setValue(d);
                    setActiveStartDate(
                      new Date(d.getFullYear(), d.getMonth(), 1)
                    );
                  }}
                >
                  <div
                    className="cal-tl-dot"
                    style={{
                      background:
                        count.dividend > 0
                          ? "#2ecc71"
                          : count.split > 0
                          ? "#60a5fa"
                          : "#a78bfa",
                    }}
                  ></div>
                  <div className="cal-tl-box">
                    <div className="cal-tl-date">{formattedDate}</div>
                    {Object.entries(count).map(
                      ([cat, n]) =>
                        n > 0 && (
                          <div
                            key={cat}
                            className={`cal-tl-chip ${
                              cat === "dividend"
                                ? "cal-chip-dividend"
                                : cat === "split"
                                ? "cal-chip-split"
                                : "cal-chip-default"
                            }`}
                            onClick={(e) => {
                              e.stopPropagation(); // prevent box click
                              handlePillClick(ev.date, cat);
                            }}
                          >
                            {cat.charAt(0).toUpperCase() + cat.slice(1)}({n})
                          </div>
                        )
                    )}
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    );
  };

  if (datasetError) {
    return (
      <>
        {!errorDismissed && (
          <div className="inline-error-box1">
            <strong>Data Error</strong>
            <p>
              Oops — dataset parsing failed. Click Reload to refresh the app and
              try again.
            </p>

            <button
              className="reload1-btn"
              onClick={() => window.location.reload()}
            >
              Reload
            </button>
          </div>
        )}

        {!errorDismissed && (
          <div className="calendar-container blank-page"></div>
        )}
      </>
    );
  }

  return (
    <div className="calendar-container">
      <h2>Events Calendar</h2>

      <div className="calendar-header">
        <button className="nav-btn" onClick={prevMonth}>
          ◀
        </button>
        <div className="header-controls">
          <CustomSelect
            options={months}
            valueIndex={currentMonth}
            onChangeIndex={changeMonth}
          />
          <CustomSelect
            options={years.map(String)}
            valueIndex={years.indexOf(currentYear)}
            onChangeIndex={(idx) => changeYear(years[idx])}
          />
        </div>
        <button className="nav-btn" onClick={nextMonth}>
          ▶
        </button>
      </div>

      <button
        className="fullscreen-btn"
        onClick={() => setFullscreenTimeline(true)}
      >
        ⛶
      </button>
      <button
        className="show-timeline-btn"
        onClick={() => setFullscreenTimeline(true)}
      >
        Show Timeline
      </button>

      {isLoading ? (
        <div className="calendar-shimmer">
          {Array.from({ length: 42 }).map((_, i) => (
            <div key={i} className="calendar-shimmer-tile" />
          ))}
        </div>
      ) : (
        <div style={{ display: "flex", gap: "24px", alignItems: "flex-start" }}>
          <Calendar
            onClickDay={handleDayClick}
            value={value}
            activeStartDate={activeStartDate}
            onActiveStartDateChange={({ activeStartDate }) =>
              setActiveStartDate(activeStartDate)
            }
            tileContent={tileContent}
            tileClassName={tileClassName}
            prevLabel={null}
            nextLabel={null}
          />

          {/* Desktop inline timeline only */}
          <div className="timeline-desktop">
            {!fullscreenTimeline && (
              <Timeline activeMonth={currentMonth} activeYear={currentYear} />
            )}
          </div>
        </div>
      )}

      {fullscreenTimeline && (
        <>
          <div
            className="fullscreen-blur-bg"
            onClick={() => setFullscreenTimeline(false)}
          ></div>
          <div className="fullscreen-timeline">
            <button
              className="close-fullscreen-btn"
              onClick={() => setFullscreenTimeline(false)}
            >
              ✖
            </button>
            <Timeline activeMonth={currentMonth} activeYear={currentYear} />
          </div>
        </>
      )}

      {selectedDate && popupEvents.length > 0 && (
        <div className="popup-overlay" onClick={closePopup}>
          <div className="popup-box" onClick={(e) => e.stopPropagation()}>
            <h3>
              Events on {selectedDate} ({selectedCategory})
            </h3>
            <ul className="popup-event-list">
              {popupEvents.map((ev, i) => (
                <li key={i}>
                  <div>{ev.note || "No note"}</div>
                </li>
              ))}
            </ul>
            <button className="close-btn" onClick={closePopup}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default CustomCalendar;
