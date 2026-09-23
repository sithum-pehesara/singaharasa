// Auth Logic and Routing with Firebase

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

// Login
document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value.trim();
    const pass = document.getElementById('login-password').value;
    const errorEl = document.getElementById('login-error');
    errorEl.style.display = 'none';

    // Admin Hardcoded Email for Demo
    if (email === 'admin@gmail.com' && pass === '123456789') {
        sessionStorage.setItem('adminAuth', 'true');
        sessionStorage.removeItem('customerAuth');
        window.location.href = 'admin.html';
        return;
    }

    // Local Storage Mock Auth
    let users = JSON.parse(localStorage.getItem('mockUsers') || '[]');
    let foundUser = users.find(u => u.email === email && u.password === pass);

    // Support default user@gmail.com (and common typo user@gamil.com) if they haven't registered explicitly
    if (!foundUser && (email === 'user@gmail.com' || email === 'user@gamil.com') && pass === '123456789') {
        foundUser = { email: 'user@gmail.com', name: 'User' };
    }

    if (foundUser) {
        sessionStorage.setItem('customerAuth', 'true');
        sessionStorage.setItem('customerEmail', foundUser.email);
        sessionStorage.setItem('customerName', foundUser.name);
        sessionStorage.removeItem('adminAuth');
        window.location.href = 'index.html';
    } else {
        errorEl.textContent = 'Invalid email or password.';
        errorEl.style.display = 'block';
    }
});

// Register
document.getElementById('register-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('reg-name').value.trim();
    const email = document.getElementById('reg-email').value.trim();
    const pass = document.getElementById('reg-password').value;
    const errorEl = document.getElementById('reg-error');
    errorEl.style.display = 'none';

    let users = JSON.parse(localStorage.getItem('mockUsers') || '[]');
    
    if (users.find(u => u.email === email) || email === 'admin@gmail.com' || email === 'user@gmail.com') {
        errorEl.textContent = 'Email already exists.';
        errorEl.style.display = 'block';
        return;
    }

    try {
        // Save to LocalStorage (Mock Database)
        users.push({ name: name, email: email, password: pass });
        localStorage.setItem('mockUsers', JSON.stringify(users));
        
        // Auto login as customer after register
        sessionStorage.setItem('customerAuth', 'true');
        sessionStorage.setItem('customerEmail', email);
        sessionStorage.setItem('customerName', name);
        window.location.href = 'index.html';
    } catch (error) {
        console.error("Registration Error:", error);
        errorEl.textContent = error.message || 'Error creating account.';
        errorEl.style.display = 'block';
    }
});
