const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const multer = require('multer');
const fs = require('fs');
const { spawn } = require('child_process');

const upload = multer({ storage: multer.memoryStorage() });

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// CRUD endpoints
app.get('/tasks', async (req, res) => {
  try {
    const tasks = await pool.query('SELECT * FROM tasks ORDER BY "order" ASC');
    res.json(tasks.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

app.get('/tasks/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const { rows } = await pool.query('SELECT * FROM tasks WHERE id = $1', [id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Task not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/tasks', async (req, res) => {
  const { title, description } = req.body;
  try {
    const { rows } = await pool.query(
      'INSERT INTO tasks (title, description) VALUES ($1, $2) RETURNING *',
      [title, description]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.put('/tasks/:id', async (req, res) => {
  const { id } = req.params;
  const { title, description, completed, order } = req.body;
  try {
    const { rows } = await pool.query(
      `UPDATE tasks SET title=$1, description=$2, completed=$3, "order"=$4 WHERE id=$5 RETURNING *`,
      [title, description, completed || false, order || 0, id]
    );
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

app.delete('/tasks/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM tasks WHERE id = $1', [id]);
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// CSV upload endpoint
app.post('/upload-csv-python', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No CSV file uploaded" });

  const tmpPath = `./tmp-${Date.now()}.csv`;
  fs.writeFileSync(tmpPath, req.file.buffer);

  const columns = (req.body.columns || "").split(",").map(c => c.trim()).join(",");
  const py = spawn('python3', ['find_duplicates.py', tmpPath, columns]);

  let output = '';
  py.stdout.on('data', data => { output += data.toString(); });
  py.stderr.on('data', data => { console.error("Python error:", data.toString()); });

  py.on('close', () => {
    fs.unlinkSync(tmpPath);
    try {
      const jsonOutput = JSON.parse(output);
      res.status(200).json(jsonOutput);
    } catch (err) {
      res.status(500).json({ error: "Failed to parse Python output", details: output });
    }
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
