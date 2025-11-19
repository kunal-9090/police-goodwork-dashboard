const Excel = require("exceljs");
const path = require("path");

async function exportNDPSExcel(data, fileName) {
  const workbook = new Excel.Workbook();
  const sheet = workbook.addWorksheet("NDPS Report");

  sheet.columns = [
    { header: "Officer Name", key: "officer" },
    { header: "District", key: "district" },
    { header: "Cases Registered", key: "cases" },
    { header: "Arrests", key: "arrests" },
    { header: "Ganja (Kg)", key: "ganja" },
    { header: "Brown Sugar (gm)", key: "brownSugar" },
    { header: "Vehicles Seized", key: "vehicles" },
    { header: "Cash (₹)", key: "cash" },
    { header: "Points Awarded", key: "points" }
  ];

  data.forEach((entry) => {
    sheet.addRow({
      officer: entry.officerId.name,
      district: entry.districtId,
      cases: entry.casesRegistered,
      arrests: entry.personsArrested,
      ganja: entry.ganjaSeizedKg,
      brownSugar: entry.brownSugarSeizedGm,
      vehicles: entry.vehiclesSeized,
      cash: entry.cashSeized,
      points: entry.pointsAwarded,
    });
  });

  const filePath = path.join(__dirname, "../generated", fileName);
  await workbook.xlsx.writeFile(filePath);

  return filePath;
}

module.exports = { exportNDPSExcel };
