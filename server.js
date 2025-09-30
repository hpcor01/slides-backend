require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { MongoClient } = require("mongodb");

const app = express();
app.use(cors());
app.use(express.json());

const MONGO_URI = process.env.MONGO_URI;
const DB_NAME = "dbSlides";
const COLLECTION = "colTema";

if (!MONGO_URI) {
  console.error("❌ ERRO: defina MONGO_URI nas variáveis de ambiente.");
  process.exit(1);
}

const client = new MongoClient(MONGO_URI);

async function start() {
  try {
    await client.connect();
    console.log("✅ Conectado ao MongoDB Atlas");

    const db = client.db(DB_NAME);
    const colTema = db.collection(COLLECTION);

    app.get("/api/slides", async (_req, res) => {
      try {
        const docs = await colTema.find({}).sort({ dataHora: -1 }).toArray();
        res.json(docs);
      } catch (err) {
        res.status(500).json({ error: "Erro ao buscar slides" });
      }
    });

    app.post("/api/slides", async (req, res) => {
      try {
        const { assunto, texto } = req.body;
        if (!assunto || !texto) return res.status(400).json({ error: "Assunto e texto obrigatórios" });

        const novo = {
          autor: "Autor Teste",
          assunto,
          texto,
          dataHora: new Date()
        };

        const result = await colTema.insertOne(novo);
        novo._id = result.insertedId;
        res.status(201).json(novo);
      } catch (err) {
        res.status(500).json({ error: "Erro ao salvar slide" });
      }
    });

    app.get("/", (_req, res) => res.send("Slides API OK"));

    const PORT = process.env.PORT || 10000;
    app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
  } catch (err) {
    console.error("Erro na inicialização:", err);
    process.exit(1);
  }
}

start();