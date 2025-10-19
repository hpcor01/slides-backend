// server.js (modificado para compatibilidade com o frontend)
// Suporta ambas as rotas:
//  - GET  /        -> retorna array de documentos (para App.jsx e slides-client.js)
//  - POST /        -> insere novo slide, aceita body { data, assunto, texto, autor }
//  - GET  /slides  -> rota paginada com page & limit (mantida)
//  - POST /slides  -> insere novo slide (alternativa)

const express = require("express");
const { MongoClient } = require("mongodb");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// 🔹 string de conexão — substitua se quiser forçar a sua diretamente
const uri = process.env.MONGO_URI || "mongodb+srv://sysdba:LFpxAegi7gMZuHlT@eightcluster.nblda.mongodb.net/dbSlides?retryWrites=true&w=majority&appName=eightCluster";
const client = new MongoClient(uri);
const dbName = "dbSlides";
const colName = "colTema";

async function getCollection() {
  if (!client.topology || !client.topology.isConnected()) {
    await client.connect();
  }
  const db = client.db(dbName);
  return db.collection(colName);
}

// 🔹 GET / — compatível com frontend que faz fetch(API_URL/)
app.get("/", async (req, res) => {
  try {
    const collection = await getCollection();
    const page = parseInt(req.query.page) || null;
    const limit = parseInt(req.query.limit) || null;

    if (page && limit) {
      const skip = (page - 1) * limit;
      const total = await collection.countDocuments();
      const slides = await collection.find({}).sort({ "slide.data": -1 }).skip(skip).limit(limit).toArray();
      return res.json({ success: true, slides, total, totalPages: Math.ceil(total / limit), currentPage: page });
    }

    // Sem paginação → retorna lista simples
    const slides = await collection.find({}).sort({ "slide.data": -1 }).toArray();
    return res.json(slides);
  } catch (err) {
    console.error("Erro ao buscar slides:", err);
    res.status(500).json({ success: false, message: "Erro ao buscar slides" });
  }
});

// 🔹 GET /slides — rota paginada opcional
app.get("/slides", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const collection = await getCollection();
    const total = await collection.countDocuments();
    const slides = await collection.find({}).sort({ "slide.data": -1 }).skip(skip).limit(limit).toArray();

    res.json({
      success: true,
      slides,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    });
  } catch (err) {
    console.error("Erro ao buscar slides:", err);
    res.status(500).json({ success: false, message: "Erro ao buscar slides" });
  }
});
