/**
 * Rota paginada para slides:
 *  GET /api/slides?page=1&perPage=10
 *
 * Ajuste o model/data conforme sua aplicação (Mongoose, JSON em disco, array, etc).
 *
 * Coloque este arquivo na raiz do slides-backend e importe no seu app principal:
 *   const slidesPagination = require('./slidesPagination');
 *   app.use('/api', slidesPagination);
 */

const express = require("express");
const router = express.Router();

// Ajuste para seu modelo real, ex:
// const Slide = require('./models/Slide');

let slidesData;
try {
  slidesData = require("./data/slides.json"); // opcional: coloque data/slides.json como seed
} catch (e) {
  slidesData = null;
}

router.get("/slides", async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const perPage = Math.max(1, parseInt(req.query.perPage, 10) || 10);
  const skip = (page - 1) * perPage;

  try {
    // Se usar mongoose, descomente e ajuste:
    // const [items, total] = await Promise.all([
    //   Slide.find({}).skip(skip).limit(perPage).lean(),
    //   Slide.countDocuments({})
    // ]);
    // return res.json({ data: items, total, page, perPage });

    if (Array.isArray(slidesData)) {
      const total = slidesData.length;
      const items = slidesData.slice(skip, skip + perPage);
      return res.json({ data: items, total, page, perPage });
    }

    return res.status(501).json({
      error: "Rota criada, mas não há fonte de dados configurada. Configure model Slide ou data/slides.json",
    });
  } catch (err) {
    console.error("Erro na paginação de slides:", err);
    return res.status(500).json({ error: "Erro interno" });
  }
});

module.exports = router;
