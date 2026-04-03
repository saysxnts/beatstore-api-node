const express = require("express");
const { PrismaClient } = require("@prisma/client");

const router = express.Router();
const prisma = new PrismaClient();

// Converte um Drive ID em URL pública de imagem (capa)
function coverUrl(id) {
  return `https://drive.google.com/thumbnail?sz=w800&id=${id}`;
}

// Converte um Drive ID em URL de preview de áudio (streaming)
function audioUrl(id) {
  return `https://drive.google.com/uc?export=download&id=${id}`;
}

router.get("/", async (req, res) => {
  try {
    const beats = await prisma.beat.findMany({
      orderBy: { id: "asc" },
    });

    // Monta as URLs públicas a partir dos IDs do Drive
    const response = beats.map((beat) => ({
      id:       beat.id,
      name:     beat.name,
      producer: beat.producer,
      price:    beat.price,
      tags:     beat.tags,
      coverUrl: coverUrl(beat.coverDriveId),
      audioUrl: audioUrl(beat.audioPreviewDriveId),
    }));

    res.json(response);
  } catch (err) {
    console.error("Erro ao buscar beats:", err);
    res.status(500).json({ error: "Erro ao buscar beats." });
  }
});

module.exports = router;
