document.addEventListener('DOMContentLoaded', () => {
    const passwordInput = document.getElementById('password');
    const loginBtn = document.getElementById('login-btn');
    const errorMessage = document.getElementById('error-message');

    function checkPassword() {
        if (passwordInput.value === '2005') {
            sessionStorage.setItem('loggedIn', 'true');
            window.location.href = 'game.html';
        } else {
            errorMessage.style.display = 'block';
            passwordInput.value = '';
        }
    }

    loginBtn.addEventListener('click', checkPassword);

    passwordInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            checkPassword();
        }
    });
});
