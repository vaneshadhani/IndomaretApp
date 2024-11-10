const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.get('/login', (req, res) => {
    res.render('login', { errorMessage: null });
});

router.post('/login', authController.login);

router.post('/reset-password', authController.resetPassword);

router.get('/dashboard', (req, res) => {
    if (!req.session.kasir) {
        return res.redirect('/login');
    }

    res.render('dashboard', { kasir: req.session.kasir });
});

router.get('/personalia', authController.getPersonaliaPage);

router.post('/presensi', authController.simpanPresensi);

router.post('/profil/signin', authController.signInProfil);

router.get('/profil/:nik', authController.getProfilPage);

module.exports = router;
