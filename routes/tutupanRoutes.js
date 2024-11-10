const express = require('express'); 
const router = express.Router();
const bcrypt = require('bcryptjs');
const indomaretDB = require('../config/indomaret_db');

router.get('/', (req, res) => {
    const today = new Date().toISOString().slice(0, 10); 
    const query = `
        SELECT 
            kode_item, 
            nama_item, 
            SUM(qty) AS total_qty, 
            SUM(subtotal_plus_tax) AS total_revenue
        FROM 
            laporan_penjualan 
        WHERE 
            DATE(tanggal_transaksi) = ?
        GROUP BY 
            kode_item, nama_item
    `;

    indomaretDB.query(query, [today], (err, results) => {
        if (err) {
            console.error("Error saat mengambil data tutupan harian:", err);
            return res.render('tutupan-harian', { errorMessage: 'Gagal mengambil data', laporan: [], total_pendapatan: 0, total_item_terjual: 0 });
        }

        const totalPendapatan = results.reduce((sum, item) => sum + item.total_revenue, 0);
        const totalItemTerjual = results.reduce((sum, item) => sum + item.total_qty, 0);

        res.render('tutupan-harian', { laporan: results, total_pendapatan: totalPendapatan, total_item_terjual: totalItemTerjual, errorMessage: null });
    });
});

router.post('/verifikasi', (req, res) => {
    const { nik, password } = req.body;
    const query = 'SELECT * FROM karyawan WHERE nik = ?';

    indomaretDB.query(query, [nik], (err, results) => {
        if (err || results.length === 0) {
            console.error('Error saat verifikasi.', err);
            return res.json({ success: false });
        }

        const karyawan = results[0];
        if (password === karyawan.password) {
            res.json({ success: true });
        } else {
            res.json({ success: false });
        }
    });
});

router.post('/tutupan', (req, res) => {
    const today = new Date().toISOString().slice(0, 10);
    const query = `
        INSERT INTO laporan_tutupan (tanggal, total_pendapatan, total_item_terjual)
        SELECT ?, SUM(subtotal_plus_tax), SUM(qty) 
        FROM laporan_penjualan 
        WHERE DATE(tanggal_transaksi) = ?
    `;

    indomaretDB.query(query, [today, today], (err, results) => {
        if (err) {
            console.error("Error saat menyimpan data tutupan harian:", err);
            return res.json({ success: false });
        }

        res.json({ success: true });
    });
});

router.post('/clear-tutupan', (req, res) => {
    const query = 'DELETE FROM laporan_penjualan WHERE DATE(tanggal_transaksi) = CURDATE()';
    
    indomaretDB.query(query, (err) => {
        if (err) {
            console.error("Error saat menghapus data tutupan harian:", err);
            return res.json({ success: false, message: 'Gagal menghapus data.' });
        }
        res.json({ success: true });
    });
});

module.exports = router;
