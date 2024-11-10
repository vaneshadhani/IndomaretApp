function openModal() {
    document.getElementById('resetPasswordModal').style.display = 'flex';
    document.body.classList.add('blur');
}

function closeModal() {
    document.getElementById('resetPasswordModal').style.display = 'none';
    document.body.classList.remove('blur');
}

document.getElementById('resetPasswordForm').addEventListener('submit', async function(e) {
  e.preventDefault();
  const nik = document.getElementById('resetNIK').value.trim();
  const newPassword = document.getElementById('resetPassword').value.trim();

  console.log('NIK yang diambil:', nik);
  console.log('Password baru yang diambil:', newPassword);

  if (!nik || !newPassword) {
      alert('NIK dan Password baru harus diisi!');
      return;
  }

  try {
      const response = await fetch('/reset-password', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify({ nik, newPassword }),
      });

      const data = await response.json();
      console.log('Response dari server:', data);
      if (data.success) {
          alert('Password berhasil diperbarui!');
          document.getElementById('resetPasswordForm').reset(); 
          closeModal();
      } else {
          alert(data.message || 'Terjadi kesalahan, coba lagi nanti.');
      }
  } catch (error) {
      console.error('Error:', error);
      alert('Terjadi kesalahan server. Silakan coba lagi.');
  }
});
