require("dotenv").config();
const express = require("express");
const cors = require("cors");

const beatsRouter    = require("./routes/beats");
const checkoutRouter = require("./routes/checkout");
const audioRouter    = require("./routes/audio");

const app = express();

// Necessário para o Render (e outros proxies) passarem o IP real corretamente
app.set("trust proxy", 1);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    const allowed = (process.env.CORS_ORIGINS || "http://localhost:3000").split(",").map(o => o.trim());
    const ok = allowed.some(o => origin === o) || origin.endsWith(".vercel.app") || origin === "http://localhost:3000";
    if (ok) return callback(null, true);
    callback(new Error("Not allowed by CORS"));
  }
}));

app.use(express.json());

app.get("/health", (req, res) => res.json({ status: "ok" }));

app.use("/api/beats",    beatsRouter);
app.use("/api/checkout", checkoutRouter);
app.use("/api/audio",    audioRouter);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));