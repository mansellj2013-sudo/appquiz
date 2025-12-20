// PDF Controller - Handles PDF management from Google Cloud Storage
const { Storage } = require("@google-cloud/storage");
const path = require("path");

// Initialize Google Cloud Storage
let storage;
try {
  console.log(
    `[PDF Controller] Project ID: ${process.env.GOOGLE_CLOUD_PROJECT}`
  );
  console.log(`[PDF Controller] Bucket: ${process.env.GOOGLE_CLOUD_BUCKET}`);

  let storageConfig = {
    projectId: process.env.GOOGLE_CLOUD_PROJECT,
  };

  // Check for credentials from environment variable (Heroku)
  if (process.env.GOOGLE_CLOUD_KEY_JSON) {
    console.log(
      "[PDF Controller] Loading credentials from GOOGLE_CLOUD_KEY_JSON environment variable"
    );
    const credentials = JSON.parse(process.env.GOOGLE_CLOUD_KEY_JSON);
    storageConfig.credentials = credentials;
  } else {
    // Fall back to local file (development)
    const keyPath = path.join(__dirname, "../google-cloud-key.json");
    console.log(`[PDF Controller] Loading credentials from: ${keyPath}`);
    storageConfig.keyFilename = keyPath;
  }

  storage = new Storage(storageConfig);
  console.log("[PDF Controller] Google Cloud Storage initialized successfully");
} catch (error) {
  console.error(
    "[PDF Controller] Error initializing Google Cloud Storage:",
    error
  );
}

const bucketName = process.env.GOOGLE_CLOUD_BUCKET || "appquiz-pdfs";
const bucket = storage
  ? storage.bucket(bucketName, {
      userProject: process.env.GOOGLE_CLOUD_PROJECT,
    })
  : null;

// Set the user project on the bucket for all operations
if (bucket) {
  bucket.userProject = process.env.GOOGLE_CLOUD_PROJECT;
}

exports.listPdfs = async (req, res) => {
  try {
    if (!bucket) {
      throw new Error(
        "Google Cloud Storage not initialized. Check credentials."
      );
    }

    console.log("[PDF Controller] Listing PDFs from bucket:", bucketName);

    // Get all files in the bucket
    const [files] = await bucket.getFiles({
      userProject: process.env.GOOGLE_CLOUD_PROJECT,
    });
    console.log(`[PDF Controller] Found ${files.length} files in bucket`);

    // Filter PDF files and organize by folder
    const pdfsByFolder = {};

    files.forEach((file) => {
      // Skip folders (they end with /)
      if (file.name.endsWith("/")) return;

      // Only include PDF files
      if (!file.name.toLowerCase().endsWith(".pdf")) return;

      console.log(`[PDF Controller] Found PDF: ${file.name}`);

      // Extract folder name
      const parts = file.name.split("/");
      const folderName = parts.length > 1 ? parts[0] : "Root";
      const fileName = parts[parts.length - 1];

      if (!pdfsByFolder[folderName]) {
        pdfsByFolder[folderName] = [];
      }

      pdfsByFolder[folderName].push({
        name: fileName,
        fullPath: file.name,
        displayName: fileName.replace(/\.pdf$/i, ""),
      });
    });

    // Sort files within each folder
    Object.keys(pdfsByFolder).forEach((folder) => {
      pdfsByFolder[folder].sort((a, b) =>
        a.displayName.localeCompare(b.displayName)
      );
    });

    res.render("pdfs", {
      pdfsByFolder: pdfsByFolder,
      totalPdfs: files.filter((f) => f.name.toLowerCase().endsWith(".pdf"))
        .length,
    });
  } catch (error) {
    console.error("Error listing PDFs:", error.message);
    console.error("Error stack:", error.stack);
    console.error("Error details:", {
      code: error.code,
      status: error.status,
      message: error.message,
    });
    res.status(500).json({
      error: "Something went wrong!",
      message: error.message || "Failed to load PDFs",
      details: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};

exports.getPdfUrl = async (req, res) => {
  try {
    const fileName = req.params.file;

    // Security: prevent directory traversal
    if (fileName.includes("..") || fileName.startsWith("/")) {
      return res.status(400).json({ error: "Invalid file name" });
    }

    const file = bucket.file(fileName);

    // Generate signed URL valid for 24 hours
    const [url] = await file.getSignedUrl({
      version: "v4",
      action: "read",
      expires: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
      userProject: process.env.GOOGLE_CLOUD_PROJECT,
    });

    res.json({ url: url });
  } catch (error) {
    console.error("Error generating PDF URL:", error.message);
    console.error("Error stack:", error.stack);
    res.status(500).json({
      error: "Error accessing PDF",
      details: error.message,
    });
  }
};

exports.downloadPdf = async (req, res) => {
  try {
    const fileName = req.params.file;

    // Security: prevent directory traversal
    if (fileName.includes("..") || fileName.startsWith("/")) {
      return res.status(400).send("Invalid file name");
    }

    const file = bucket.file(fileName);

    // Check if file exists
    const [exists] = await file.exists({
      userProject: process.env.GOOGLE_CLOUD_PROJECT,
    });
    if (!exists) {
      return res.status(404).send("PDF not found");
    }

    // Set headers for download
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${fileName.split("/").pop()}"`
    );
    res.setHeader("Content-Type", "application/pdf");

    // Stream the file
    file
      .createReadStream({
        userProject: process.env.GOOGLE_CLOUD_PROJECT,
      })
      .pipe(res);
  } catch (error) {
    console.error("Error downloading PDF:", error);
    res.status(500).send("Error downloading PDF");
  }
};
