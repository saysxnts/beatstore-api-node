const express = require("express");
const https = require("https");
const http = require("http");

const router = express.Router();

/**
 * GET /api/audio/:driveId
 * Faz proxy do áudio do Google Drive com suporte a Range requests
 * (necessário para o player HTML5 funcionar corretamente)
 */
router.get("/:driveId", (req, res) => {
  const { driveId } = req.params;
  const url = `https://drive.google.com/uc?id=${driveId}&export=download&confirm=t`;

  const makeRequest = (targetUrl, redirectCount = 0) => {
    if (redirectCount > 5) {
      return res.status(500).send("Too many redirects");
    }

    const lib = targetUrl.startsWith("https") ? https : http;

    const options = {
      headers: {
        "User-Agent": "Mozilla/5.0",
        "Range": req.headers.range || "bytes=0-",
      },
    };

    lib.get(targetUrl, options, (driveRes) => {
      const { statusCode, headers } = driveRes;

      // Segue redirecionamentos
      if (statusCode >= 300 && statusCode < 400 && headers.location) {
        driveRes.resume();
        return makeRequest(headers.location, redirectCount + 1);
      }

      if (statusCode !== 200 && statusCode !== 206) {
        driveRes.resume();
        return res.status(statusCode).send("Erro ao buscar áudio.");
      }

      // Cabeçalhos para streaming
      const responseHeaders = {
        "Content-Type": headers["content-type"] || "audio/mpeg",
        "Accept-Ranges": "bytes",
        "Cache-Control": "public, max-age=3600",
      };

      if (headers["content-length"]) {
        responseHeaders["Content-Length"] = headers["content-length"];
      }

      if (headers["content-range"]) {
        responseHeaders["Content-Range"] = headers["content-range"];
      }

      res.writeHead(statusCode, responseHeaders);
      driveRes.pipe(res);
    }).on("error", (err) => {
      console.error("Erro no proxy de áudio:", err.message);
      if (!res.headersSent) res.status(500).send("Erro interno.");
    });
  };

  makeRequest(url);
});

module.exports = router;
