// utils/calendarUtils.js

// Convert any date to YYYY-MM-DD in LOCAL timezone
const toLocalDateKey = (date) => {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(d.getDate()).padStart(2, "0")}`;
};

// Group events by local date
export const getEventsByDate = (data) => {
  return data.reduce((acc, item) => {
    const dateKey = toLocalDateKey(item.date);
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(item);
    return acc;
  }, {});
};

// Check if a specific date has events
export const hasEvent = (eventsMap, date) => {
  const dateKey = toLocalDateKey(date);
  return eventsMap[dateKey] || null;
};

// Utility helpers
export const daysInMonth = (month, year) =>
  new Date(year, month + 1, 0).getDate();

export const monthStartDay = (month, year) => new Date(year, month, 1).getDay();
