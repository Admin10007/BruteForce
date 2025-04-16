// Profilni tahrirlash
document.getElementById('editProfileForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const profileImage = document.getElementById('profileImage').files[0];

    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    currentUser.name = name;
    currentUser.email = email;
    if (profileImage) {
        const reader = new FileReader();
        reader.onload = () => {
            currentUser.profileImage = reader.result;
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            updateUsers(currentUser);
            window.location.reload();
        };
        reader.readAsDataURL(profileImage);
    } else {
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        updateUsers(currentUser);
        window.location.reload();
    }
});

// Foydalanuvchilar ro'yxatini yangilash
function updateUsers(updatedUser) {
    let users = JSON.parse(localStorage.getItem('users') || '[]');
    users = users.map(u => u.email === updatedUser.email ? updatedUser : u);
    localStorage.setItem('users', JSON.stringify(users));
}

// Profil rasmini oldindan ko'rish
document.getElementById('profileImage')?.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            document.getElementById('profileImagePreview').src = event.target.result;
        };
        reader.readAsDataURL(file);
    }
});

// Parolni o'zgartirish
document.getElementById('changePasswordForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    if (currentPassword !== currentUser.password) {
        showError('changePasswordError', 'Joriy parol noto‘g‘ri!');
        return;
    }

    if (newPassword !== confirmPassword) {
        showError('changePasswordError', 'Yangi parol va tasdiqlash mos kelmadi!');
        return;
    }

    currentUser.password = newPassword;
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    updateUsers(currentUser);
    closeModal('changePasswordModal');
    alert('Parol muvaffaqiyatli yangilandi!');
});