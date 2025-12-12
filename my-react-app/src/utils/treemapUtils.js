export const transformData = (data, type) => {
  if (!Array.isArray(data)) return [];

  // Map to objects with numeric value
  const mapped = data.map((item) => ({
    name: type === "sectors" ? item.sector_name : item.company_name,
    value: Number(item.mcap) || 0,
    raw: item,
  }));

  // sort by value ascending(for colors)
  const sorted = [...mapped].sort((a, b) => a.value - b.value);

  // computing median
  const n = sorted.length;
  let median = 0;
  if (n > 0) {
    if (n % 2 === 1) {
      median = sorted[(n - 1) / 2].value;
    } else {
      median = (sorted[n / 2 - 1].value + sorted[n / 2].value) / 2;
    }
  }

  //(above=green,below=red,equal=yellow)
  const aboveColor = "#2ecc71"; // green
  const belowColor = "#e74c3c"; // red
  const equalColor = "#f1c40f"; // yellow

  return mapped.map((d) => ({
    name: d.name,
    value: d.value,
    color:
      d.value > median
        ? aboveColor
        : d.value < median
        ? belowColor
        : equalColor,
  }));
};
