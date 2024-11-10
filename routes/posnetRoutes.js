const express = require('express');
const router = express.Router();
const indomaretDB = require('../config/indomaret_db');

function simpanLaporanPenjualan(items, kasir, callback) {
    const tanggal = new Date().toISOString().slice(0, 19).replace('T', ' ');
    const query = 'INSERT INTO laporan_penjualan (kode_item, nama_item, qty, harga, subtotal_plus_tax, tanggal_transaksi, kasir) VALUES (?, ?, ?, ?, ?, ?, ?)';

    let completedQueries = 0;
    let errorOccurred = false;

    items.forEach(item => {
        if (errorOccurred) return;

        const { kodeBarang, namaBarang, quantity, harga, subtotal } = item;
        console.log("Menyimpan item:", item);

        indomaretDB.query(query, [kodeBarang, namaBarang, quantity, harga, subtotal, tanggal, kasir], (err) => {
            completedQueries++;
            if (err) {
                errorOccurred = true;
                console.error("Error saat menyimpan item:", err);
                callback(err);
            } else if (completedQueries === items.length && !errorOccurred) {
                callback(null);
            }
        });
    });

    if (items.length === 0) callback(null);
}

router.get('/', (req, res) => {
    if (!req.session.items) req.session.items = [];
    if (!req.session.total) req.session.total = 0;  

    const kasir = req.session.kasir || 'Default Kasir';
    const nomorStruk = req.session.nomorStruk || 'AUTO';

    console.log("Kasir:", kasir); 
    console.log("Nomor Struk:", nomorStruk);

    res.render('posnet', {
        items: req.session.items,
        total: req.session.total,
        kasir: kasir,
        nomorStruk: nomorStruk,
        errorMessage: null
    });
});

router.post('/tambah-item', (req, res) => {
    const { kodeBarang, quantity } = req.body;
    const query = 'SELECT * FROM penerimaan_barang WHERE kode_barang = ?';

    indomaretDB.query(query, [kodeBarang], (err, results) => {
        if (err || results.length === 0) {
            console.error('Error atau barang tidak ditemukan:', err);
            return res.render('posnet', {
                items: req.session.items || [],               
                total: req.session.total || 0,               
                kasir: req.session.kasir || 'Default Kasir',  
                nomorStruk: req.session.nomorStruk || 'AUTO',
                errorMessage: 'Barang tidak ditemukan atau stok habis.'
            });
        }

        const barang = results[0];
        if (quantity > barang.quantity) {
            return res.render('posnet', {
                items: req.session.items || [],               
                total: req.session.total || 0,                
                kasir: req.session.kasir || 'Default Kasir',  
                nomorStruk: req.session.nomorStruk || 'AUTO',
                errorMessage: 'Stok tidak mencukupi.'
            });
        }

        const insertQuery = 'INSERT INTO temporary_cart (session_id, kode_barang, nama_barang, quantity, harga, subtotal) VALUES (?, ?, ?, ?, ?, ?)';
        const sessionId = req.sessionID; 
        const subtotal = barang.harga * quantity;

        indomaretDB.query(insertQuery, [sessionId, barang.kode_barang, barang.nama_barang, quantity, barang.harga, subtotal], (insertErr) => {
            if (insertErr) {
                console.error("Error saat menyimpan ke temporary_cart:", insertErr);
                return res.render('posnet', {
                    items: req.session.items || [],               
                    total: req.session.total || 0,                
                    kasir: req.session.kasir || 'Default Kasir',  
                    nomorStruk: req.session.nomorStruk || 'AUTO',
                    errorMessage: 'Gagal menambahkan item ke keranjang.'
                });
            }

            if (!req.session.items) req.session.items = [];
            req.session.items.push({
                kode_barang: barang.kode_barang,
                nama_barang: barang.nama_barang,
                quantity: parseInt(quantity),
                harga: barang.harga,
                subtotal: subtotal
            });

            req.session.total = (req.session.total || 0) + subtotal;

            console.log("Item berhasil ditambahkan ke keranjang.");
            res.redirect('/sales/posnet'); 
        });
    });
});

router.post('/hapus-item', (req, res) => {
    const { kodeBarang } = req.body;

    if (!req.session.items) return res.redirect('/sales/posnet');

    req.session.items = req.session.items.filter(item => item.kode_barang !== kodeBarang);
    req.session.total = req.session.items.reduce((total, item) => total + item.subtotal, 0);

    res.redirect('/sales/posnet');
});

router.post('/bayar', (req, res) => {
    const sessionId = req.sessionID;
    const kasir = req.session.kasir || 'Tidak Diketahui';

    const selectQuery = 'SELECT * FROM temporary_cart WHERE session_id = ?';
    indomaretDB.query(selectQuery, [sessionId], (err, items) => {
        if (err || items.length === 0) {
            console.error("Tidak ada item di keranjang atau terjadi kesalahan:", err);
            return res.json({ success: false, message: "Keranjang kosong atau terjadi kesalahan." });
        }

        const insertQuery = 'INSERT INTO laporan_penjualan (kode_item, nama_item, qty, harga, subtotal_plus_tax, tanggal_transaksi, kasir) VALUES (?, ?, ?, ?, ?, NOW(), ?)';
        let errorOccurred = false;
        let completedQueries = 0;

        items.forEach((item, index) => {
            indomaretDB.query(insertQuery, [item.kode_barang, item.nama_barang, item.quantity, item.harga, item.subtotal, kasir], (insertErr) => {
                if (insertErr) {
                    console.error("Error saat menyimpan transaksi ke laporan_penjualan:", insertErr);
                    errorOccurred = true;
                } else {
                    const updateQuery = 'UPDATE penerimaan_barang SET quantity = quantity - ? WHERE kode_barang = ?';
                    indomaretDB.query(updateQuery, [item.quantity, item.kode_barang], (updateErr) => {
                        if (updateErr) {
                            console.error("Error saat mengurangi qty di penerimaan_barang:", updateErr);
                            errorOccurred = true;
                        } else {
                            console.log(`Quantity untuk ${item.kode_barang} berhasil dikurangi sebesar ${item.quantity}`);
                        }
                    });
                }

                completedQueries++;

                if (completedQueries === items.length) {
                    if (errorOccurred) {
                        return res.json({ success: false, message: "Gagal menyimpan beberapa item atau memperbarui stok." });
                    } else {
                        const deleteQuery = 'DELETE FROM temporary_cart WHERE session_id = ?';
                        indomaretDB.query(deleteQuery, [sessionId], (deleteErr) => {
                            if (deleteErr) {
                                console.error("Error saat menghapus temporary_cart:", deleteErr);
                                return res.json({ success: false, message: "Transaksi berhasil, tetapi gagal mengosongkan keranjang." });
                            }

                            console.log("Transaksi berhasil dan keranjang kosong.");
                            return res.json({ success: true, message: "Transaksi berhasil disimpan dan stok telah diperbarui." });
                        });
                    }
                }
            });
        });
    });
});

router.post('/clear-session', (req, res) => {
    req.session.items = [];
    req.session.total = 0;
    req.session.nomorStruk = null;

    res.redirect('/sales/posnet');
});

module.exports = router;