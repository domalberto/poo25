const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Database setup
const db = new sqlite3.Database('games.db', (err) => {
    if (err) {
        console.error('Erro ao conectar ao banco de dados:', err);
    } else {
        console.log('Conectado ao banco de dados SQLite');
        // Criar tabela se não existir
        db.run(`CREATE TABLE IF NOT EXISTS games (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            genre TEXT,
            description TEXT,
            requirements TEXT,
            imageUrl TEXT
        )`);
    }
});

// API Endpoints
app.get('/api/games', (req, res) => {
    db.all('SELECT * FROM games', [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

app.post('/api/games', (req, res) => {
    const { title, genre, description, requirements, imageUrl } = req.body;
    const sql = `INSERT INTO games (title, genre, description, requirements, imageUrl) 
                 VALUES (?, ?, ?, ?, ?)`;
    
    db.run(sql, [title, genre, description, requirements, imageUrl], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ id: this.lastID });
    });
});

app.put('/api/games/:id', (req, res) => {
    const { title, genre, description, requirements, imageUrl } = req.body;
    const sql = `UPDATE games 
                 SET title = ?, genre = ?, description = ?, requirements = ?, imageUrl = ?
                 WHERE id = ?`;
    
    db.run(sql, [title, genre, description, requirements, imageUrl, req.params.id], (err) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ message: 'Jogo atualizado com sucesso' });
    });
});

app.delete('/api/games/:id', (req, res) => {
    db.run('DELETE FROM games WHERE id = ?', req.params.id, (err) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ message: 'Jogo excluído com sucesso' });
    });
});

app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});
