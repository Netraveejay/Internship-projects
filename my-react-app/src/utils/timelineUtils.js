// Group events by date (fix timezone shift)
export const getEventsByDate = (data) => {
  return data.reduce((acc, item) => {
    if (!item.date) return acc;

    // Extract the date part BEFORE the space
    const rawDate = item.date.split(" ")[0]; // "2025-07-24"

    const [year, month, day] = rawDate.split("-").map(Number);

    // Construct pure local date (no timezone!)
    const dateKey = `${year}-${String(month).padStart(2, "0")}-${String(
      day
    ).padStart(2, "0")}`;

    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(item);

    return acc;
  }, {});
};
