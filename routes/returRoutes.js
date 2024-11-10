const express = require('express');
const router = express.Router();
const indomaretDB = require('../config/indomaret_db');
const gudangDB = require('../config/gudang_db'); 

router.get('/', (req, res) => {
    res.render('retur');
});

router.post('/', (req, res) => {
    const { kodeBarang, quantity, category } = req.body;
    const checkIndomaretQuery = 'SELECT * FROM penerimaan_barang WHERE kode_barang = ?';

    indomaretDB.query(checkIndomaretQuery, [kodeBarang], (err, results) => {
        if (err || results.length === 0) {
            console.error("Error or item not found in Indomaret:", err);
            return res.json({ success: false, message: "Item not available for return." });
        }

        const item = results[0];
        if (quantity > item.quantity) {
            return res.json({ success: false, message: "Insufficient stock for return." });
        }

        const updateIndomaretQuery = 'UPDATE penerimaan_barang SET quantity = quantity - ? WHERE kode_barang = ?';
        indomaretDB.query(updateIndomaretQuery, [quantity, kodeBarang], (updateErr) => {
            if (updateErr) {
                console.error("Error updating Indomaret stock:", updateErr);
                return res.json({ success: false, message: "Failed to update Indomaret stock." });
            }

            const checkGudangQuery = 'SELECT * FROM barang_gudang WHERE kode_barang = ?';
            gudangDB.query(checkGudangQuery, [kodeBarang], (gudangErr, gudangResults) => {
                if (gudangErr) {
                    console.error("Error checking Gudang stock:", gudangErr);
                    return res.json({ success: false, message: "Failed to check Gudang stock." });
                }

                if (gudangResults.length > 0) {
                    const updateGudangQuery = 'UPDATE barang_gudang SET quantity = quantity + ? WHERE kode_barang = ?';
                    gudangDB.query(updateGudangQuery, [quantity, kodeBarang], (updateGudangErr) => {
                        if (updateGudangErr) {
                            console.error("Error updating Gudang stock:", updateGudangErr);
                            return res.json({ success: false, message: "Failed to update Gudang stock." });
                        }
                        res.json({ success: true, message: "Item successfully returned to Gudang." });
                    });
                } else {
                    const insertGudangQuery = 'INSERT INTO barang_gudang (kode_barang, nama_barang, quantity, category) VALUES (?, ?, ?, ?)';
                    gudangDB.query(insertGudangQuery, [kodeBarang, item.nama_barang, quantity, category], (insertGudangErr) => {
                        if (insertGudangErr) {
                            console.error("Error inserting into Gudang:", insertGudangErr);
                            return res.json({ success: false, message: "Failed to insert into Gudang." });
                        }
                        res.json({ success: true, message: "Item successfully returned to Gudang." });
                    });
                }
            });
        });
    });
});

module.exports = router;
