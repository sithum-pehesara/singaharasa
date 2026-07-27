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

    // Hardcoded Admin Check (For Demo Purposes)
    if (email === 'admin@gmail.com' && pass === '123456789') {
        sessionStorage.setItem('adminAuth', 'true');
        sessionStorage.removeItem('customerAuth');
        window.location.href = 'admin.html';
        return;
    }

    // Default Customer Credentials Check (For Demo)
    if (email === 'user@gmail.com' && pass === '123456789') {
        sessionStorage.setItem('customerAuth', 'true');
        sessionStorage.setItem('customerEmail', email);
        sessionStorage.removeItem('adminAuth');
        window.location.href = 'index.html';
        return;
    }

    try {
        // Authenticate with Firebase
        const userCredential = await auth.signInWithEmailAndPassword(email, pass);
        
        sessionStorage.setItem('customerAuth', 'true');
        sessionStorage.setItem('customerEmail', userCredential.user.email);
        sessionStorage.removeItem('adminAuth');
        window.location.href = 'index.html';
    } catch (error) {
        console.error("Login Error:", error);
        errorEl.textContent = error.message || 'Invalid credentials.';
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

    if (email === 'sithumpehesara000@gmail.com' || email === 'user@gmail.com') {
        errorEl.textContent = 'Email already exists.';
        errorEl.style.display = 'block';
        return;
    }

    try {
        // Create user in Firebase Auth
        const userCredential = await auth.createUserWithEmailAndPassword(email, pass);
        
        // Update profile with name (optional but good for UI)
        await userCredential.user.updateProfile({
            displayName: name
        });

        // Store additional user details in Firestore
        await db.collection('users').doc(userCredential.user.uid).set({
            name: name,
            email: email,
            role: 'customer',
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        // Auto login as customer after register
        sessionStorage.setItem('customerAuth', 'true');
        sessionStorage.setItem('customerEmail', email);
        window.location.href = 'index.html';
    } catch (error) {
        console.error("Registration Error:", error);
        errorEl.textContent = error.message || 'Error creating account.';
        errorEl.style.display = 'block';
    }
});
