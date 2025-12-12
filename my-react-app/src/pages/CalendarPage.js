import React from "react";
import CustomCalendar from "../components/calendar/CustomCalendar";

function CalendarPage({ theme, setTheme }) {
  return (
    <div className={`page ${theme}`}>
      <CustomCalendar theme={theme} setTheme={setTheme} />
    </div>
  );
}

export default CalendarPage; // ✅ Default export
