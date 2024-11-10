const express = require('express');
const router = express.Router();
const indomaretDB = require('../config/indomaret_db');

router.get('/', (req, res) => {
    const today = new Date().toISOString().split('T')[0];

    const query = `
        SELECT * 
        FROM laporan_penjualan 
        WHERE DATE(tanggal_transaksi) = ?
        ORDER BY tanggal_transaksi DESC
    `;
    
    indomaretDB.query(query, [today], (err, results) => {
        if (err) {
            console.error("Error saat mengambil data laporan penjualan:", err);
            return res.render('laporan-sales', { 
                errorMessage: 'Gagal mengambil data laporan penjualan', 
                laporan: [] 
            });
        }
        
        res.render('laporan-sales', { 
            laporan: results, 
            errorMessage: null 
        });
    });
});

module.exports = router;
