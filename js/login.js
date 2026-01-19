document.addEventListener('DOMContentLoaded', () => {
    const passwordInput = document.getElementById('password');
    const loginBtn = document.getElementById('login-btn');
    const errorMessage = document.getElementById('error-message');

    async function checkPassword() {
        const password = passwordInput.value;
        const msgUint8 = new TextEncoder().encode(password);
        const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

        if (hashHex === 'a20a2b7bb0842d5cf8a0c06c626421fd51ec103925c1819a51271f2779afa730') {
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
