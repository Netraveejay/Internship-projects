const fs = require("fs");

// --- Generate stock prices & annotations for 50 companies ---
function generateData(numCompanies = 100, entriesPerCompany = 5) {
  const stockPricesData = [];
  const annotationsData = [];
  const categories = ["result", "dividend", "split"];

  for (let i = 1; i <= numCompanies; i++) {
    const companyCode = `C${100 + i}`; // C101 ... C150

    for (let j = 0; j < entriesPerCompany; j++) {
      const year = 2020 + Math.floor(Math.random() * 4); // 2020-2023
      const month = Math.floor(Math.random() * 12) + 1;
      const day = Math.floor(Math.random() * 28) + 1;
      const date = `${year}-${String(month).padStart(2, "0")}-${String(
        day
      ).padStart(2, "0")}`;

      const price = Number((Math.random() * 100 + 50).toFixed(2)); // Price 50-150
      stockPricesData.push({ company_code: companyCode, date, price });

      // ~30% chance to generate an annotation
      if (Math.random() < 0.3) {
        const category =
          categories[Math.floor(Math.random() * categories.length)];
        const annotation = {
          company_code: companyCode,
          date,
          category,
          note: `This is a ${category} event`,
        };
        if (category === "dividend")
          annotation.divamt = (Math.random() * 10).toFixed(2);
        if (category === "split")
          annotation.splitval = `${Math.floor(Math.random() * 3) + 2}:1`;

        annotationsData.push(annotation);
      }
    }
  }

  return { stockPricesData, annotationsData };
}

// --- Generate and save JSON files ---
const { stockPricesData, annotationsData } = generateData(100, 5);

fs.writeFileSync(
  "data_stockPrices.json",
  JSON.stringify({ data: stockPricesData }, null, 2)
);
fs.writeFileSync(
  "data_annotations.json",
  JSON.stringify({ data: annotationsData }, null, 2)
);

console.log(
  "JSON files generated: data_stockPrices.json & data_annotations.json"
);
