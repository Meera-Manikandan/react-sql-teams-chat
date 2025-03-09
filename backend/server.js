const express = require("express");
const cors = require("cors");
var bodyParser = require('body-parser');
require("dotenv").config({ path: __dirname + "/.env" });
const authRoutes = require("./routes/authRoutes");
const postRoutes = require("./routes/postRoutes");

const app = express();
app.use(cors());
app.use(express.json());
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/auth", authRoutes);
app.use("/posts", postRoutes);
app.use("/uploads", express.static("uploads")); // Serve uploaded images

const PORT = process.env.PORT || 5001;
app.use(cors({ origin: "http://localhost:5173" }));

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
