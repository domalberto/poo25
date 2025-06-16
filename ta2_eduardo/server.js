const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// Conexão com o banco de dados
const db = new sqlite3.Database('books.db', (err) => {
    if (err) {
        console.error('Erro ao conectar ao banco de dados:', err);
    } else {
        console.log('Conectado ao banco de dados SQLite');
        createTable();
    }
});

// Criar tabela de livros
function createTable() {
    db.run(`
        CREATE TABLE IF NOT EXISTS books (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            author TEXT NOT NULL,
            description TEXT,
            image TEXT,
            read BOOLEAN DEFAULT 0,
            favorite BOOLEAN DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);
}

// Rotas CRUD

// Criar livro
app.post('/api/books', (req, res) => {
    const { title, author, description, image } = req.body;
    const sql = `INSERT INTO books (title, author, description, image) VALUES (?, ?, ?, ?)`;
    
    db.run(sql, [title, author, description, image], function(err) {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
        res.json({
            id: this.lastID,
            title,
            author,
            description,
            image,
            read: false,
            favorite: false
        });
    });
});

// Ler todos os livros
app.get('/api/books', (req, res) => {
    const sql = `SELECT * FROM books ORDER BY created_at DESC`;
    
    db.all(sql, [], (err, rows) => {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// Ler livro específico
app.get('/api/books/:id', (req, res) => {
    const sql = `SELECT * FROM books WHERE id = ?`;
    
    db.get(sql, [req.params.id], (err, row) => {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
        if (!row) {
            res.status(404).json({ error: 'Livro não encontrado' });
            return;
        }
        res.json(row);
    });
});

// Atualizar livro
app.put('/api/books/:id', (req, res) => {
    const { title, author, description, image, read, favorite } = req.body;
    const sql = `
        UPDATE books 
        SET title = ?, author = ?, description = ?, image = ?, read = ?, favorite = ?
        WHERE id = ?
    `;
    
    db.run(sql, [title, author, description, image, read, favorite, req.params.id], function(err) {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
        res.json({
            id: req.params.id,
            title,
            author,
            description,
            image,
            read,
            favorite
        });
    });
});

// Deletar livro
app.delete('/api/books/:id', (req, res) => {
    const sql = `DELETE FROM books WHERE id = ?`;
    
    db.run(sql, [req.params.id], function(err) {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
        res.json({ message: 'Livro deletado com sucesso' });
    });
});

// Iniciar servidor
app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
}); 