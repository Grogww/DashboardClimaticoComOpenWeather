const express = require("express");
const path = require("path");
require("dotenv").config();

const weatherRoutes = require("./src/routes/weatherRoutes");

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files (View layer)
app.use(express.static(path.join(__dirname, "public")));

// API routes
app.use("/api", weatherRoutes);

app.listen(PORT, () => {
  console.log(`☂ Server running at http://localhost:${PORT}`);
});
