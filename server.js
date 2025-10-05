const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

// Conexão com MongoDB
mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("✅ Conectado ao MongoDB"))
.catch(err => console.error("❌ Erro ao conectar ao MongoDB:", err));

// Modelo ColTema (collection colTema)
const colTemaSchema = new mongoose.Schema({
  slide: {
    data: String,
    assunto: String,
    texto: String,
    autor: { type: String, default: "Desconhecido" }
  }
});

const ColTema = mongoose.model("ColTema", colTemaSchema, "colTema");

// Rota para cadastrar documento na colTema
app.post("/", async (req, res) => {
  try {
    const { data, assunto, texto, autor } = req.body;

    if (!data || !assunto || !texto) {
      return res.status(400).json({ error: "Data, assunto e texto são obrigatórios" });
    }

    const novoDoc = new ColTema({
      slide: {
        data,
        assunto,
        texto,
        autor: autor || "Desconhecido"
      }
    });

    await novoDoc.save();

    res.json(novoDoc);
  } catch (err) {
    res.status(500).json({ error: "Erro ao salvar registro em colTema" });
  }
});

// Rota para listar documentos da colTema (com limite inicial de 5)
app.get("/", async (req, res) => {
  try {
    const limite = parseInt(req.query.limite) || 5;
    const docs = await ColTema.find().limit(limite);
    res.json(docs);
  } catch (err) {
    res.status(500).json({ error: "Erro ao buscar registros na colTema" });
  }
});

// Teste rápido
app.get("/status", (req, res) => {
  res.send("🚀 API de ColTema rodando!");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
