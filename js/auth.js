// Auth Logic and Routing

function toggleForm(formType) {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    
    if (formType === 'register') {
        loginForm.classList.remove('active');
        registerForm.classList.add('active');
    } else {
        registerForm.classList.remove('active');
        loginForm.classList.add('active');
    }
}

// Password Visibility Toggle
window.togglePassword = function(inputId, btn) {
    const input = document.getElementById(inputId);
    if (input.type === 'password') {
        input.type = 'text';
        btn.textContent = '🙈';
    } else {
        input.type = 'password';
        btn.textContent = '👁️';
    }
};

// Ensure local storage has users array
if (!localStorage.getItem('users')) {
    localStorage.setItem('users', JSON.stringify([]));
}

// Login
document.getElementById('login-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value.trim();
    const pass = document.getElementById('login-password').value;
    const errorEl = document.getElementById('login-error');

    // Admin Credentials Check
    if (email === 'sithumpehesara000@gmail.com' && pass === 'krishanthi') {
        sessionStorage.setItem('adminAuth', 'true');
        sessionStorage.removeItem('customerAuth');
        window.location.href = 'admin.html';
        return;
    }

    // Default Customer Credentials Check
    if (email === 'user@gmail.com' && pass === '123456789') {
        sessionStorage.setItem('customerAuth', 'true');
        sessionStorage.setItem('customerEmail', email);
        sessionStorage.removeItem('adminAuth');
        window.location.href = 'customer.html';
        return;
    }

    // Check custom registered users
    const users = JSON.parse(localStorage.getItem('users'));
    const user = users.find(u => u.email === email && u.password === pass);

    if (user) {
        sessionStorage.setItem('customerAuth', 'true');
        sessionStorage.setItem('customerEmail', email);
        sessionStorage.removeItem('adminAuth');
        window.location.href = 'customer.html';
        return;
    }

    // If none match
    errorEl.style.display = 'block';
});

// Register
document.getElementById('register-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('reg-name').value.trim();
    const email = document.getElementById('reg-email').value.trim();
    const pass = document.getElementById('reg-password').value;
    const errorEl = document.getElementById('reg-error');

    const users = JSON.parse(localStorage.getItem('users'));
    
    if (users.find(u => u.email === email) || email === 'sithumpehesara000@gmail.com' || email === 'user@gmail.com') {
        errorEl.textContent = 'Email already exists.';
        errorEl.style.display = 'block';
        return;
    }

    users.push({ name, email, password: pass });
    localStorage.setItem('users', JSON.stringify(users));

    // Auto login as customer after register
    sessionStorage.setItem('customerAuth', 'true');
    sessionStorage.setItem('customerEmail', email);
    window.location.href = 'customer.html';
});
