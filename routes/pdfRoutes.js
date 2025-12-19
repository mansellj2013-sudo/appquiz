// PDF Routes
const express = require("express");
const router = express.Router();
const pdfController = require("../controllers/pdfController");

// List all PDFs
router.get("/", pdfController.listPdfs);

// Get signed URL for viewing PDF in browser
router.get("/url/:file", pdfController.getPdfUrl);

// Download PDF
router.get("/download/:file", pdfController.downloadPdf);

module.exports = router;
