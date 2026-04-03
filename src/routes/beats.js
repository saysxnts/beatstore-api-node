const express = require("express");
const { PrismaClient } = require("@prisma/client");

const router = express.Router();
const prisma = new PrismaClient();

function coverUrl(id) {
  return `https://drive.google.com/thumbnail?sz=w800&id=${id}`;
}

function audioUrl(id, apiUrl) {
  return `${apiUrl}/api/audio/${id}`;
}

router.get("/", async (req, res) => {
  try {
    const beats = await prisma.beat.findMany({
      orderBy: { id: "asc" },
    });

    const apiUrl = process.env.API_URL || "http://localhost:8080";

    const response = beats.map((beat) => ({
      id:       beat.id,
      name:     beat.name,
      producer: beat.producer,
      price:    beat.price,
      tags:     beat.tags,
      coverUrl: coverUrl(beat.coverDriveId),
      audioUrl: audioUrl(beat.audioPreviewDriveId, apiUrl),
    }));

    res.json(response);
  } catch (err) {
    console.error("Erro ao buscar beats:", err);
    res.status(500).json({ error: "Erro ao buscar beats." });
  }
});

module.exports = router;