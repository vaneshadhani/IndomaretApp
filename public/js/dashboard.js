function updateDateTime() {
    const hariList = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const bulanList = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

    const now = new Date();
    const hari = hariList[now.getDay()];
    const tanggal = now.getDate();
    const bulan = bulanList[now.getMonth()];
    const tahun = now.getFullYear();
    const jam = String(now.getHours()).padStart(2, '0');
    const menit = String(now.getMinutes()).padStart(2, '0');
    const detik = String(now.getSeconds()).padStart(2, '0');

    document.getElementById('tanggal').textContent = `Hari/Tanggal: ${hari}, ${tanggal} ${bulan} ${tahun}`;
    document.getElementById('waktu').textContent = `Pukul: ${jam}.${menit}.${detik}`;
}

function openLogoutModal() {
    document.getElementById('logoutModal').style.display = 'flex';
    document.body.classList.add('blur');
}

function closeLogoutModal() {
    document.getElementById('logoutModal').style.display = 'none';
    document.body.classList.remove('blur');
}

function logout() {
    window.location.href = '/login';
}

setInterval(updateDateTime, 1000);
updateDateTime();
