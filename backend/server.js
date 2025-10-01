const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');

const app = express();
const PORT = 5000;

// Middlewares
app.use(cors());
app.use(express.json());

// Crear/conectar base de datos
const db = new sqlite3.Database('./gatos.db', (err) => {
  if (err) {
    console.error('Error al conectar con la base de datos:', err);
  } else {
    console.log('Conectado a la base de datos SQLite');
  }
});

// Crear tabla si no existe
db.run(`CREATE TABLE IF NOT EXISTS gatos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre TEXT NOT NULL,
  edad INTEGER NOT NULL,
  color TEXT NOT NULL,
  fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP
)`);

// RUTAS (endpoints)

// 1. Obtener todos los gatos
app.get('/api/gatos', (req, res) => {
  db.all('SELECT * FROM gatos ORDER BY fecha_registro DESC', [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// 2. Agregar un gato nuevo
app.post('/api/gatos', (req, res) => {
  const { nombre, edad, color } = req.body;
  
  db.run(
    'INSERT INTO gatos (nombre, edad, color) VALUES (?, ?, ?)',
    [nombre, edad, color],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({
        id: this.lastID,
        nombre,
        edad,
        color
      });
    }
  );
});

// 3. Eliminar un gato
app.delete('/api/gatos/:id', (req, res) => {
  const { id } = req.params;
  
  db.run('DELETE FROM gatos WHERE id = ?', [id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ message: 'Gato eliminado', cambios: this.changes });
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});