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

// Modelo Slide
const slideSchema = new mongoose.Schema({
  assunto: String,
  texto: String,
  autor: { type: String, default: "Autor Teste" },
  dataHora: { type: Date, default: Date.now }
});

const Slide = mongoose.model("Slide", slideSchema);

// Rota para cadastrar slide
app.post("/api/slides", async (req, res) => {
  try {
    const { assunto, texto } = req.body;

    if (!assunto || !texto) {
      return res.status(400).json({ error: "Assunto e texto são obrigatórios" });
    }

    const novoSlide = new Slide({ assunto, texto });
    await novoSlide.save();

    res.json(novoSlide);
  } catch (err) {
    res.status(500).json({ error: "Erro ao salvar slide" });
  }
});

// Rota para listar slides (com limite inicial de 5)
app.get("/api/slides", async (req, res) => {
  try {
    const limite = parseInt(req.query.limite) || 5;
    const slides = await Slide.find().sort({ dataHora: -1 }).limit(limite);
    res.json(slides);
  } catch (err) {
    res.status(500).json({ error: "Erro ao buscar slides" });
  }
});

// Teste rápido
app.get("/", (req, res) => {
  res.send("🚀 API de Slides rodando!");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
