const express = require("express");
const cors = require("cors");
var bodyParser = require("body-parser");
const path = require("path");
const fs = require("fs");
require("dotenv").config({ path: __dirname + "/.env" });
const authRoutes = require("./routes/authRoutes");
const postRoutes = require("./routes/postRoutes");

const app = express();
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/auth", authRoutes);
app.use("/posts", postRoutes);
//app.use("/uploads", express.static("uploads")); // Serve uploaded images
// Serve uploaded files statically

// Ensure the uploads directory exists
const uploadDir = path.join(__dirname, "uploads");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true }); // Creates folder if it doesn't exist
}
console.log("Uploads directory ready:", uploadDir);

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const PORT = process.env.PORT || 5001;
app.use(cors({ origin: "http://localhost:5173" }));

app.listen(PORT, () => console.log(`Backend API running on port ${PORT}`));
