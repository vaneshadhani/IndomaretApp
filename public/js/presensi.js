function openModal() {
    document.getElementById('presensiModal').style.display = 'flex';
    document.body.classList.add('blur');
}

function closeModal() {
    document.getElementById('presensiModal').style.display = 'none';
    document.body.classList.remove('blur');
}

document.getElementById('presensiForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    const nik = document.getElementById('nik').value.trim();
    const status = document.getElementById('status').value;

    try {
        const response = await fetch('/presensi', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ nik, status }),
        });

        const data = await response.json();

        if (data.success) {
            alert('Presensi berhasil disimpan!');
            const table = document.getElementById('presensiTable');
            const newRow = table.insertRow();
            newRow.insertCell(0).textContent = data.presensi.nik;
            newRow.insertCell(1).textContent = data.presensi.status;
            newRow.insertCell(2).textContent = data.presensi.tanggal;

            closeModal();
        } else {
            alert(data.message || 'Terjadi kesalahan, coba lagi nanti.');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Terjadi kesalahan server. Silakan coba lagi.');
    }
});
