const express = require("express");
const multer = require("multer");
const AWS = require("aws-sdk");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors()); // Enable CORS for all routes

// Configure AWS S3 client
AWS.config.update({
  region: "your-region",
  accessKeyId: "your-access-key",
  secretAccessKey: "your-secret-key",
});

// Configure AWS S3 client
AWS.config.update({
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

const s3 = new AWS.S3();

// Configure file storage with Multer
const storage = multer.memoryStorage();
const upload = multer({ storage });

// File upload endpoint
app.post("/upload", upload.array("files"), async (req, res) => {
  try {
    const uploadPromises = req.files.map(async (file) => {
      const params = {
        Bucket: "your-bucket-name",
        Key: file.originalname,
        Body: file.buffer,
        ContentType: file.mimetype,
        ACL: "public-read",
      };

      await s3.upload(params).promise();
    });

    await Promise.all(uploadPromises);

    res.status(200).json({ message: "Files uploaded successfully" });
  } catch (error) {
    console.error("File upload failed:", error);
    res.status(500).json({ message: "File upload failed", error });
  }
});

const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
