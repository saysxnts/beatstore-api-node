require("dotenv").config();
const express = require("express");
const cors = require("cors");

const beatsRouter    = require("./routes/beats");
const checkoutRouter = require("./routes/checkout");

const app = express();

app.use(cors({ origin: process.env.CORS_ORIGINS || "http://localhost:3000" }));
app.use(express.json());

app.get("/health", (req, res) => res.json({ status: "ok" }));

app.use("/api/beats",    beatsRouter);
app.use("/api/checkout", checkoutRouter);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
