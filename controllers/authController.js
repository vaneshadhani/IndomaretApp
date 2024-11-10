const connection = require('../config/indomaret_db');
const gudangDB = require('../config/gudang_db'); // Koneksi ke gudang database

exports.login = (req, res) => {
    const { nik, password } = req.body;

    if (!nik || !password) {
        return res.render('login', { errorMessage: 'NIK dan Password harus diisi!' });
    }

    const query = 'SELECT * FROM karyawan WHERE nik = ? AND password = ?';
    connection.query(query, [nik, password], (err, results) => {
        if (err) {
            console.error('Error saat menjalankan query login:', err);
            return res.render('login', { errorMessage: 'Terjadi kesalahan pada server. Coba lagi nanti.' });
        }

        if (results.length > 0) {
            const karyawan = results[0];

            req.session.kasir = karyawan.nama;
            req.session.nik = karyawan.nik;

            res.redirect('/dashboard');
        } else {
            res.render('login', { errorMessage: 'NIK atau Password salah!' });
        }
    });
};

function getNomorStruk(callback) {
    const tanggal = new Date().toISOString().split('T')[0]; 
    const query = 'SELECT COUNT(*) as jumlahTransaksi FROM transaksi WHERE tanggal = ?';

    connection.query(query, [tanggal], (err, results) => {
        if (err) {
            console.error('Error saat mengambil jumlah transaksi:', err);
            return callback(err);
        }

        const nomorStruk = results[0].jumlahTransaksi + 1;
        callback(null, nomorStruk);
    });
}

exports.resetPassword = (req, res) => {
    const { nik, newPassword } = req.body;

    if (!nik || !newPassword) {
        return res.json({ success: false, message: 'NIK dan Password baru harus diisi!' });
    }

    const updateQuery = 'UPDATE karyawan SET password = ? WHERE nik = ?';
    connection.query(updateQuery, [newPassword, nik], (err, results) => {
        if (err) {
            console.error('Error saat menjalankan query reset password:', err);
            return res.json({ success: false, message: 'Terjadi kesalahan pada server. Coba lagi nanti.' });
        }

        if (results.affectedRows > 0) {
            res.json({ success: true, message: 'Password berhasil diperbarui' });
        } else {
            res.json({ success: false, message: 'NIK tidak ditemukan' });
        }
    });
};

exports.getPersonaliaPage = (req, res) => {
    const query = 'SELECT * FROM presensi';

    connection.query(query, (err, results) => {
        if (err) {
            console.error('Error saat mengambil data presensi:', err);
            return res.render('personalia', { presensiData: [] }); 
        }

        res.render('personalia', { presensiData: results });
    });
};

exports.simpanPresensi = (req, res) => {
    const { nik, status } = req.body;
    const tanggal = new Date().toISOString().split('T')[0];
    const query = 'INSERT INTO presensi (nik, status, tanggal) VALUES (?, ?, ?)';
    connection.query(query, [nik, status, tanggal], (err, results) => {
        if (err) {
            console.error('Error saat menyimpan presensi:', err);
            return res.json({ success: false, message: 'Terjadi kesalahan saat menyimpan presensi' });
        }

        res.json({
            success: true,
            presensi: { nik, status, tanggal },
        });
    });
};

exports.signInProfil = (req, res) => {
    const { nik, password } = req.body;

    const query = 'SELECT * FROM karyawan WHERE nik = ?';
    connection.query(query, [nik], (err, results) => {
        if (err) {
            console.error('Error saat mengambil data karyawan:', err);
            return res.json({ success: false, message: 'Terjadi kesalahan pada server.' });
        }

        if (results.length > 0) {
            const karyawan = results[0];

            if (karyawan.password === password) {
                res.json({ success: true });
            } else {
                res.json({ success: false, message: 'Password salah.' });
            }
        } else {
            res.json({ success: false, message: 'NIK tidak ditemukan.' });
        }
    });
};

exports.getProfilPage = (req, res) => {
    const { nik } = req.params;

    const query = 'SELECT * FROM karyawan WHERE nik = ?';
    connection.query(query, [nik], (err, results) => {
        if (err) {
            console.error('Error saat mengambil data profil:', err);
            return res.render('profil', { karyawan: null, errorMessage: 'Terjadi kesalahan pada server.' });
        }

        if (results.length > 0) {
            res.render('profil', { karyawan: results[0], errorMessage: null });
        } else {
            res.render('profil', { karyawan: null, errorMessage: 'Data karyawan tidak ditemukan.' });
        }
    });
};

exports.getFakturGudang = (req, res) => {
    const nomorFaktur = req.params.nomorFaktur;

    const query = 'SELECT * FROM faktur_gudang WHERE nomor_faktur = ?';
    gudangDB.query(query, [nomorFaktur], (err, results) => {
        if (err) {
            console.error('Error fetching faktur from gudang:', err);
            return res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server gudang.' });
        }

        if (results.length > 0) {
            res.render('penerimaan-barang', { dataFaktur: results, successMessage: null, errorMessage: null });
        } else {
            res.render('penerimaan-barang', { dataFaktur: [], successMessage: null, errorMessage: 'Nomor faktur tidak ditemukan.' });
        }
    });
};
