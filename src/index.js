require("dotenv").config();
const express = require("express");
const cors = require("cors");

const beatsRouter    = require("./routes/beats");
const checkoutRouter = require("./routes/checkout");

const app = express();

const allowedOrigins = (process.env.CORS_ORIGINS || "http://localhost:3000").split(",");

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.some(o => origin.startsWith(o.trim()))) {
      return callback(null, true);
    }
    callback(new Error("Not allowed by CORS"));
  }
}));

app.use(express.json());

app.get("/health", (req, res) => res.json({ status: "ok" }));

app.use("/api/beats",    beatsRouter);
app.use("/api/checkout", checkoutRouter);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
