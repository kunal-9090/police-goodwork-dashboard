const PDFDocument = require("pdfkit");
const QRCode = require("qrcode");
const fs = require("fs");
const path = require("path");

async function generateCertificate(officer, entry, certificateId) {
  return new Promise(async (resolve, reject) => {
    try {
      // Folder where PDFs are stored
      const certificatesDir = path.join(__dirname, "..", "certificates");

      // Create folder if missing
      if (!fs.existsSync(certificatesDir)) {
        fs.mkdirSync(certificatesDir, { recursive: true });
      }

      const fileName = `certificate_${certificateId}.pdf`;
      const filePath = path.join(certificatesDir, fileName);

      // Create PDF
      const doc = new PDFDocument({ size: "A4", margin: 50 });
      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);

      // -----------------------------
      // HEADER
      // -----------------------------
      doc.fontSize(28).text("GOOD WORK CERTIFICATE", { align: "center" }).moveDown();
      doc.fontSize(16).text("Police Department — NDPS Good Work Recognition", { align: "center" }).moveDown(2);

      // -----------------------------
      // DETAILS
      // -----------------------------
      doc.fontSize(14)
        .text(`Certificate ID: ${certificateId}`)
        .text(`Officer Name: ${officer.name}`)
        .text(`District: ${officer.districtId}`)
        .text(`Points Awarded: ${entry.pointsAwarded}`)
        .text(`Issued On: ${new Date().toDateString()}`)
        .moveDown(2);

      doc.text(
        "This certificate is awarded for outstanding performance in NDPS enforcement and successful execution of operations.",
        { align: "left" }
      ).moveDown(2);

      // -----------------------------
      // QR CODE
      // -----------------------------
      const qrData = `Certificate ID: ${certificateId}\nOfficer: ${officer.name}`;
      const qrBase64 = await QRCode.toDataURL(qrData);

      const qrBuffer = Buffer.from(qrBase64.split(",")[1], "base64");
      doc.image(qrBuffer, { width: 140 }).moveDown();

      doc.text("Scan the QR code to verify certificate authenticity.");

      doc.end();

      // Resolves with relative path (stored in DB)
      stream.on("finish", () => resolve(`certificates/${fileName}`));

    } catch (err) {
      reject(err);
    }
  });
}

module.exports = generateCertificate;
