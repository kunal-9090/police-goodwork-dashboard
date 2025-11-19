const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

function generateNDPSReportPDF(data, fileName) {
  return new Promise((resolve, reject) => {
    const pdfPath = path.join(__dirname, "../generated", fileName);

    const doc = new PDFDocument();
    const stream = fs.createWriteStream(pdfPath);

    doc.pipe(stream);

    doc.fontSize(20).text("Odisha Police - NDPS Report", { align: "center" });
    doc.moveDown();

    doc.fontSize(12).text(`Officer: ${data.officerName}`);
    doc.text(`District: ${data.district}`);
    doc.text(`Date: ${new Date().toLocaleString()}`);
    doc.moveDown();

    doc.fontSize(14).text("Case Summary:", { underline: true });
    doc.moveDown();

    Object.entries(data.metrics).forEach(([key, value]) => {
      doc.fontSize(12).text(`${key}: ${value}`);
    });

    doc.end();

    stream.on("finish", () => resolve(pdfPath));
    stream.on("error", reject);
  });
}

module.exports = { generateNDPSReportPDF };
