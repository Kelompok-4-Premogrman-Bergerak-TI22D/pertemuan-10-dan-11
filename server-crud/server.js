const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Koneksi ke MySQL (Laragon)
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',  // Laragon default: password kosong
  database: 'db_kampus'
});

// Test koneksi
db.connect((err) => {
  if (err) {
    console.error('❌ Koneksi MySQL gagal:', err.message);
    return;
  }
  console.log('✅ Backend terkoneksi ke MySQL Laragon!');
});

// ==================== CRUD ENDPOINTS ====================

// 1️⃣ READ - Ambil semua data mahasiswa
app.get('/api/mahasiswa', (req, res) => {
  const sql = 'SELECT * FROM mahasiswa ORDER BY id DESC';
  
  db.query(sql, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

// 2️⃣ CREATE - Tambah mahasiswa baru (dengan validasi NIM)
app.post('/api/mahasiswa', (req, res) => {
  const { nim, nama, jurusan, jenis_kelamin } = req.body;
  
  // Validasi input
  if (!nim || !nama || !jurusan || !jenis_kelamin) {
    return res.status(400).json({ error: 'Semua field harus diisi!' });
  }
  
  // Cek apakah NIM sudah ada
  db.query('SELECT * FROM mahasiswa WHERE nim = ?', [nim], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (results.length > 0) {
      return res.status(400).json({ error: 'NIM sudah terdaftar!' });
    }
    
    // Insert data baru
    const sql = 'INSERT INTO mahasiswa (nim, nama, jurusan, jenis_kelamin) VALUES (?, ?, ?, ?)';
    db.query(sql, [nim, nama, jurusan, jenis_kelamin], (err, result) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ 
        message: 'Data berhasil ditambahkan', 
        id: result.insertId 
      });
    });
  });
});

// 3️⃣ UPDATE - Edit data mahasiswa (dengan validasi NIM)
app.put('/api/mahasiswa/:id', (req, res) => {
  const id = req.params.id;
  const { nim, nama, jurusan, jenis_kelamin } = req.body;
  
  // Cek apakah NIM sudah dipakai mahasiswa lain
  db.query('SELECT * FROM mahasiswa WHERE nim = ? AND id != ?', [nim, id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (results.length > 0) {
      return res.status(400).json({ error: 'NIM sudah digunakan mahasiswa lain!' });
    }
    
    // Update data
    const sql = 'UPDATE mahasiswa SET nim=?, nama=?, jurusan=?, jenis_kelamin=? WHERE id=?';
    db.query(sql, [nim, nama, jurusan, jenis_kelamin, id], (err) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ message: 'Data berhasil diupdate' });
    });
  });
});

// 4️⃣ DELETE - Hapus data mahasiswa
app.delete('/api/mahasiswa/:id', (req, res) => {
  const id = req.params.id;
  const sql = 'DELETE FROM mahasiswa WHERE id=?';
  
  db.query(sql, [id], (err) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: 'Data berhasil dihapus' });
  });
});

// Jalankan server
app.listen(PORT, () => {
  console.log(`🚀 Server CRUD berjalan di http://localhost:${PORT}`);
});