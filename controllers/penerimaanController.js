const connection = require('../config/indomaret_db');
const gudangDB = require('../config/gudang_db');

exports.cariBarang = (req, res) => {
    const { nomorFaktur } = req.body;

    const query = 'SELECT * FROM faktur_gudang WHERE nomor_faktur = ?';
    gudangDB.query(query, [nomorFaktur], (err, results) => {
        if (err) {
            console.error('Error fetching faktur:', err);
            return res.render('penerimaan-barang', { dataFaktur: [], errorMessage: 'Terjadi kesalahan pada server.' });
        }

        if (results.length > 0) {
            res.render('penerimaan-barang', { dataFaktur: results, successMessage: null, errorMessage: null });
        } else {
            res.render('penerimaan-barang', { dataFaktur: [], successMessage: null, errorMessage: 'Nomor faktur tidak ditemukan.' });
        }
    });
};

exports.simpanPenerimaanBarang = (req, res) => {
    const { nomorFaktur, kode_barang, nama_barang, quantity, kategori } = req.body;

    const query = 'INSERT INTO penerimaan_barang (nomor_faktur, kode_barang, nama_barang, quantity, kategori, tanggal_penerimaan) VALUES (?, ?, ?, ?, ?, CURDATE())';
    connection.query(query, [nomorFaktur, kode_barang, nama_barang, quantity, kategori], (err, results) => {
        if (err) {
            console.error('Error saat menyimpan penerimaan barang:', err);
            return res.render('penerimaan-barang', { successMessage: null, errorMessage: 'Terjadi kesalahan saat menyimpan barang.' });
        }

        res.render('penerimaan-barang', { successMessage: 'Barang berhasil diterima dan disimpan.', errorMessage: null, dataFaktur: [] });
    });
};
