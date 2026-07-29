import express from 'express';
import 'dotenv/config';

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.get("/", (req, res) => {
  res.send("<h1>✅ Minimal Backend Working!</h1><p>Time: " + new Date().toISOString() + "</p>");
});

app.get("/api/db-status", (req, res) => {
  res.json({ status: "ok", message: "Minimal server is running" });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Minimal Server running on port ${PORT}`);
});