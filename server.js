// server.js
const express = require("express");
const { MongoClient } = require("mongodb");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// 🔹 URL remota do MongoDB (mantém a mesma que você já usa)
const uri = "mongodb+srv://sysdba:LFpxAegi7gMZuHlT@eightcluster.nblda.mongodb.net/dbSlides?retryWrites=true&w=majority&appName=eightCluster";
const client = new MongoClient(uri);
const dbName = "dbSlides";
const colName = "colTema";

// ✅ Rota para listar slides com paginação
app.get("/slides", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const db = client.db(dbName);
    const collection = db.collection(colName);

    const total = await collection.countDocuments();
    const slides = await collection
      .find({})
      .sort({ "slide.data": -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

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

// ✅ Rota para cadastrar novo slide
app.post("/slides", async (req, res) => {
  try {
    const { data, assunto, texto, autor } = req.body;

    if (!data || !assunto || !texto || !autor) {
      return res
        .status(400)
        .json({ success: false, message: "Todos os campos são obrigatórios." });
    }

    const db = client.db(dbName);
    const collection = db.collection(colName);

    const novoSlide = {
      slide: { data, assunto, texto, autor },
    };

    await collection.insertOne(novoSlide);
    res.json({ success: true, message: "Slide cadastrado com sucesso!" });
  } catch (err) {
    console.error("Erro ao cadastrar slide:", err);
    res.status(500).json({ success: false, message: "Erro ao cadastrar slide." });
  }
});

// 🔹 Inicialização do servidor
const PORT = process.env.PORT || 3001;
client.connect().then(() => {
  app.listen(PORT, () =>
    console.log(`✅ Servidor rodando na porta ${PORT}`)
  );
});
