// utils/radarUtils.js
export function buildSeries(companies = []) {
  return companies.map((item) => {
    const rawMetrics = [
      Number(item.pe_ttm) || 0,
      Number(item.roe_ttm) || 0,
      Number(item.roce_ttm) || 0,
      Number(item.pb_ttm) || 0,
      Number(item.eps_ttm) || 0,
      Number(item.mcap) || 0,
      Number(item.facevalue) || 0,
      Number(item.bookvalue) || 0,
    ];

    return {
      name: item.companyshortname || item.companyname || "",
      data: rawMetrics,
      pointPlacement: "on",
      type: "area",
      fill: true,
    };
  });
}
