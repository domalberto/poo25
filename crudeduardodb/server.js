const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");
const app = express();
const db = new sqlite3.Database("./alunos.db");

app.use(cors());
app.use(express.json());
app.use(express.static("."));

// Criar tabela se não existir
db.run("CREATE TABLE IF NOT EXISTS alunos (id INTEGER PRIMARY KEY AUTOINCREMENT, nome TEXT)");

app.get("/alunos", (req, res) => {
  db.all("SELECT * FROM alunos", [], (err, rows) => {
    if (err) return res.status(500).json(err);
    res.json(rows);
  });
});

app.post("/alunos", (req, res) => {
  const { nome } = req.body;
  db.run("INSERT INTO alunos (nome) VALUES (?)", [nome], function(err) {
    if (err) return res.status(500).json(err);
    res.json({ id: this.lastID, nome });
  });
});

app.put("/alunos/:id", (req, res) => {
  const { id } = req.params;
  const { nome } = req.body;
  db.run("UPDATE alunos SET nome = ? WHERE id = ?", [nome, id], function(err) {
    if (err) return res.status(500).json(err);
    res.sendStatus(200);
  });
});

app.delete("/alunos/:id", (req, res) => {
  const { id } = req.params;
  db.run("DELETE FROM alunos WHERE id = ?", [id], function(err) {
    if (err) return res.status(500).json(err);
    res.sendStatus(200);
  });
});

app.listen(3000, () => {
  console.log("Servidor rodando em http://localhost:3000");
});
