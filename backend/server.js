const express = require("express");
const cors = require("cors");
require("dotenv").config({ path: __dirname + "/.env" });
const authRoutes = require("./routes/authRoutes");
const postRoutes = require("./routes/postRoutes");

const app = express();
app.use(cors());
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/posts", postRoutes);
app.use("/uploads", express.static("uploads")); // Serve uploaded images

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
