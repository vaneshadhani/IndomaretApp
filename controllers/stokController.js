const connectionIndomaret = require('../config/indomaret_db');

exports.getLaporanStok = (req, res) => {
    const query = 'SELECT * FROM penerimaan_barang WHERE quantity > 0';
    connectionIndomaret.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching stock data:', err);
            return res.status(500).send('Internal Server Error');
        }
        res.render('laporan-stok', { laporanStok: results });
    });
};

exports.updateQuantity = (req, res) => {
    const { kodeBarang, jumlah } = req.body;

    if (!kodeBarang || !jumlah) {
        return res.status(400).json({ success: false, message: 'Kode Barang and Jumlah are required.' });
    }

    const getQuantityQuery = 'SELECT quantity FROM penerimaan_barang WHERE kode_barang = ?';
    connectionIndomaret.query(getQuantityQuery, [kodeBarang], (err, results) => {
        if (err) {
            console.error('Error fetching stock data:', err);
            return res.status(500).json({ success: false, message: 'Server error while fetching stock.' });
        }

        if (results.length === 0) {
            return res.status(404).json({ success: false, message: 'Item not found.' });
        }

        const currentQuantity = results[0].quantity;
        const newQuantity = currentQuantity - jumlah;

        if (newQuantity <= 0) {
            const deleteQuery = 'DELETE FROM penerimaan_barang WHERE kode_barang = ? AND quantity = 0';
            indomaretDB.query(deleteQuery, [kodeBarang], (deleteErr) => {
                if (deleteErr) {
                    console.error('Error menghapus item dari database:', deleteErr);
                } else {
                    console.log(`Item dengan kode ${kodeBarang} berhasil dihapus karena quantity mencapai 0.`);
                }
            });
        } else {
            const updateQuantityQuery = 'UPDATE penerimaan_barang SET quantity = ? WHERE kode_barang = ?';
            connectionIndomaret.query(updateQuantityQuery, [newQuantity, kodeBarang], (updateErr) => {
                if (updateErr) {
                    console.error('Error updating stock:', updateErr);
                    return res.status(500).json({ success: false, message: 'Error updating stock.' });
                }
                console.log(`Quantity untuk ${kodeBarang} diperbarui menjadi ${newQuantity}.`);
                res.status(200).json({ success: true, message: 'Stock updated successfully.' });
            });
        }

const deleteZeroQuantityItemsQuery = 'DELETE FROM penerimaan_barang WHERE quantity = 0';

connectionIndomaret.query(deleteZeroQuantityItemsQuery, (deleteErr) => {
    if (deleteErr) {
        console.error('Error menghapus barang dengan quantity 0:', deleteErr);
    } else {
        console.log('Barang dengan quantity 0 berhasil dihapus.');
    }
});

    });
};
