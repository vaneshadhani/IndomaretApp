const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const authRoutes = require('./routes/authRoutes'); 
const penerimaanRoutes = require('./routes/penerimaanRoutes'); 
const stokRoutes = require('./routes/stokRoutes'); 
const posnetRoutes = require('./routes/posnetRoutes'); 
const laporanRoutes = require('./routes/laporanRoutes');
const tutupanRoutes = require('./routes/tutupanRoutes');
const returRoutes = require('./routes/returRoutes');
const path = require('path');
const indomaretDB = require('./config/indomaret_db'); 
const app = express();
const sessionStore = new MySQLStore({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'indomaret'
});

app.use(session({
    key: 'session_cookie_name',
    secret: 'supersecret',
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 100000 * 60 * 24 } 
}));

app.use((req, res, next) => {
    if (req.session.items === undefined) {
        req.session.items = [];
    }
    if (req.session.total === undefined) {
        req.session.total = 0;
    }
    console.log("Current Session Items:", req.session.items);
    console.log("Current Session Total:", req.session.total);
    next();
});

app.use(express.static(path.join(__dirname, 'public')));

app.use(express.json());

app.use(bodyParser.urlencoded({ extended: true }));

app.set('view engine', 'ejs');

app.get('/', (req, res) => {
    res.redirect('/login');
});

app.get('/sales', (req, res) => {
    res.render('sales'); 
});

app.use('/sales/posnet', posnetRoutes);

app.use('/sales/tutupan-harian', tutupanRoutes);

app.use('/sales/laporan-sales', laporanRoutes);

app.get('/tutupan-harian', (req, res) => {
    res.render('tutupan-harian', { errorMessage: null, successMessage: null });
});

app.get('/stok', (req, res) => {
    res.render('stok', { errorMessage: null, successMessage: null }); 
});

app.get('/stok/penerimaan-barang', (req, res) => {
    res.render('penerimaan-barang', { errorMessage: null, successMessage: null, dataFaktur: null }); 
});

app.use('/stok', stokRoutes);

app.use('/penerimaan', penerimaanRoutes);

app.use('/retur', returRoutes);

app.use(authRoutes);

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server berjalan di http://localhost:${port}`);
});
