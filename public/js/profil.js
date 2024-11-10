function openProfileModal() {
    document.getElementById('profileModal').style.display = 'flex';
}

function closeProfileModal() {
    document.getElementById('profileModal').style.display = 'none';
    document.getElementById('profileNIK').value = '';
    document.getElementById('profilePassword').value = '';
}

document.getElementById('profileForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    const nik = document.getElementById('profileNIK').value.trim();
    const password = document.getElementById('profilePassword').value.trim();

    try {
        const response = await fetch('/profil/signin', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ nik, password }),
        });

        const data = await response.json();

        if (data.success) {
            window.location.href = `/profil/${nik}`;
        } else {
            alert(data.message || 'NIK atau Password salah. Coba lagi.');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Terjadi kesalahan pada server.');
    }
});

document.addEventListener('DOMContentLoaded', function() {
    const signOutButton = document.getElementById('signOut');
    console.log('Tombol Sign Out:', signOutButton);

    if (signOutButton) {
        console.log('Tombol Sign Out ditemukan, menambahkan event listener...');
        signOutButton.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Sign Out diklik. Mengarahkan ke /personalia');
            window.location.href = '/personalia';
        });
    } else {
        console.error('Tombol Sign Out tidak ditemukan!');
    }
});

const ajuanCutiButton = document.getElementById('ajuanCuti');
if (ajuanCutiButton) {
    ajuanCutiButton.addEventListener('click', function(e) {
        e.preventDefault();
        alert('Fitur Ajuan Cuti belum tersedia.');
    });
} else {
    console.error('Tombol Ajuan Cuti tidak ditemukan!');
}
