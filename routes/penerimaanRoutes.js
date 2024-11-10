const express = require('express');
const router = express.Router();
const indomaretDB = require('../config/indomaret_db');
const gudangDB = require('../config/gudang_db');

router.get('/penerimaan-barang', (req, res) => {
    res.render('penerimaan-barang', { errorMessage: null, successMessage: null, dataFaktur: null });
});

router.post('/penerimaan-barang', (req, res) => {
    const { nomorFaktur } = req.body;

    const query = `
        SELECT fg.nomor_faktur, fg.kode_barang, bg.nama_barang, fg.quantity, bg.harga 
        FROM faktur_gudang fg 
        JOIN barang_gudang bg ON fg.kode_barang = bg.kode_barang 
        WHERE fg.nomor_faktur = ?
    `;

    gudangDB.query(query, [nomorFaktur], (err, results) => {
        if (err) {
            console.error('Error saat mengambil data faktur dari gudang:', err);
            return res.render('penerimaan-barang', { errorMessage: 'Terjadi kesalahan saat mengambil data dari gudang.', successMessage: null, dataFaktur: null });
        }

        if (results.length > 0) {
            res.render('penerimaan-barang', { errorMessage: null, successMessage: null, dataFaktur: results });
        } else {
            res.render('penerimaan-barang', { errorMessage: 'Nomor faktur tidak ditemukan.', successMessage: null, dataFaktur: null });
        }
    });
});

router.post('/simpan-penerimaan-barang', (req, res) => {
    const { nomorFaktur, kode_barang, nama_barang, quantity, kategori, harga } = req.body;
    if (!nomorFaktur || !kode_barang || !nama_barang || !quantity || !kategori || !harga) {
        return res.render('penerimaan-barang', { errorMessage: 'Semua field harus diisi!', successMessage: null, dataFaktur: null });
    }

    const checkQuery = 'SELECT * FROM penerimaan_barang WHERE nomor_faktur = ? AND kode_barang = ?';
    indomaretDB.query(checkQuery, [nomorFaktur, kode_barang], (err, results) => {
        if (err) {
            console.error('Error saat memeriksa nomor faktur:', err);
            return res.status(500).render('penerimaan-barang', { errorMessage: 'Terjadi kesalahan pada server.', successMessage: null, dataFaktur: null });
        }

        if (results.length > 0) {
            return res.render('penerimaan-barang', { errorMessage: 'Nomor faktur dan kode barang ini sudah diproses sebelumnya.', successMessage: null, dataFaktur: null });
        }

        const insertQuery = `
            INSERT INTO penerimaan_barang (nomor_faktur, kode_barang, nama_barang, quantity, kategori, harga, tanggal_penerimaan)
            VALUES (?, ?, ?, ?, ?, ?, NOW())
        `;
        indomaretDB.query(insertQuery, [nomorFaktur, kode_barang, nama_barang, quantity, kategori, harga], (err, result) => {
            if (err) {
                console.error('Error saat menyimpan penerimaan barang:', err);
                return res.status(500).render('penerimaan-barang', { errorMessage: 'Terjadi kesalahan saat menyimpan data.', successMessage: null, dataFaktur: null });
            }

            const updateGudangQuery = 'UPDATE barang_gudang SET quantity = quantity - ? WHERE kode_barang = ?';
            gudangDB.query(updateGudangQuery, [quantity, kode_barang], (err) => {
                if (err) {
                    console.error('Error saat memperbarui stok di gudang:', err);
                    return res.status(500).render('penerimaan-barang', { errorMessage: 'Terjadi kesalahan saat memperbarui stok gudang.', successMessage: null, dataFaktur: null });
                }
                
                res.render('penerimaan-barang', { errorMessage: null, successMessage: 'Barang berhasil diterima dan disimpan!', dataFaktur: null });
            });
        });
    });
});

module.exports = router;
