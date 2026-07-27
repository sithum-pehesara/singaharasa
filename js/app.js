// Customer Application Logic

// Auth Check (Main site pages)
const isMainSite = window.location.pathname.endsWith('index.html') || window.location.pathname === '/' || window.location.pathname.endsWith('/');
let isGuest = false;

if (isMainSite) {
    if (sessionStorage.getItem('customerAuth') !== 'true') {
        isGuest = true;
    } else {
        const userEmail = sessionStorage.getItem('customerEmail') || 'User@guest.com';
        const nameNode = document.getElementById('profile-username');
        const emailNode = document.getElementById('profile-email');
        if(nameNode) nameNode.textContent = userEmail.split('@')[0];
        if(emailNode) emailNode.textContent = userEmail;
    }
}

// Profile Sidebar Toggle
const profileBtn = document.getElementById('profile-btn');
const closeProfileBtn = document.getElementById('close-profile-btn');
const profileSidebar = document.getElementById('profile-sidebar');
const profileOverlay = document.getElementById('profile-overlay');

if (profileBtn) {
    if (isGuest) {
        profileBtn.textContent = 'Login';
        profileBtn.addEventListener('click', () => {
            window.location.href = 'login.html';
        });
    } else {
        profileBtn.addEventListener('click', () => {
            profileSidebar.classList.add('active');
            profileOverlay.style.display = 'flex';
            setTimeout(() => profileOverlay.classList.add('active'), 10);
        });
    }
}

if (closeProfileBtn) {
    const closeProfile = () => {
        profileSidebar.classList.remove('active');
        profileOverlay.classList.remove('active');
        setTimeout(() => profileOverlay.style.display = 'none', 300);
        
        // Reset edit profile state if active
        const editProfileForm = document.getElementById('edit-profile-form');
        const editProfileBtn = document.getElementById('edit-profile-btn');
        if (editProfileForm && editProfileForm.style.display === 'block') {
            profileSidebar.classList.remove('enlarged');
            editProfileForm.style.display = 'none';
            editProfileBtn.textContent = 'Edit Profile';
            editProfileBtn.classList.remove('btn-primary');
            editProfileBtn.classList.add('btn-outline');
        }
    };
    closeProfileBtn.addEventListener('click', closeProfile);
    profileOverlay.addEventListener('click', closeProfile);
}

// Edit Profile Logic
const editProfileBtn = document.getElementById('edit-profile-btn');
const editProfileForm = document.getElementById('edit-profile-form');
const editUsernameInput = document.getElementById('edit-username');
const editPasswordInput = document.getElementById('edit-password');

if (editProfileBtn && editProfileForm) {
    let isEditing = false;
    
    editProfileBtn.addEventListener('click', async () => {
        const profileUsername = document.getElementById('profile-username');
        
        if (!isEditing) {
            // Enter edit mode
            isEditing = true;
            profileSidebar.classList.add('enlarged');
            editProfileForm.style.display = 'block';
            editUsernameInput.value = profileUsername.textContent; 
            editPasswordInput.value = '123456789'; // Dummy password display
        } else {
            // Clicked again (Save or Cancel)
            if (editProfileBtn.textContent === 'Save') {
                const newUsername = editUsernameInput.value.trim();
                const newPassword = editPasswordInput.value;
                
                if (newUsername) {
                    editProfileBtn.textContent = 'Saving...';
                    editProfileBtn.disabled = true;
                    
                    try {
                        const user = firebase.auth().currentUser;
                        if (user) {
                            // Update display name in Firebase Auth
                            await user.updateProfile({ displayName: newUsername });
                            
                            // Update name in Firestore users collection
                            await db.collection('users').doc(user.uid).update({
                                name: newUsername
                            });
                            
                            // Update password if changed from dummy value
                            if (newPassword && newPassword !== '123456789') {
                                await user.updatePassword(newPassword);
                            }
                        }
                    } catch (error) {
                        console.error('Error updating profile:', error);
                        alert('Error: ' + error.message);
                    }
                    
                    editProfileBtn.disabled = false;
                    profileUsername.textContent = newUsername;
                    
                    // Update email display to match actual user if logged in
                    const profileEmail = document.getElementById('profile-email');
                    if (profileEmail) {
                        const user = firebase.auth().currentUser;
                        profileEmail.textContent = user ? user.email : newUsername.toLowerCase().replace(/\s+/g, '') + '@gmail.com';
                    }
                }
            }
            
            // Revert back
            isEditing = false;
            profileSidebar.classList.remove('enlarged');
            editProfileForm.style.display = 'none';
            editProfileBtn.textContent = 'Edit Profile';
            editProfileBtn.classList.remove('btn-primary');
            editProfileBtn.classList.add('btn-outline');
        }
    });

    const handleInputChange = () => {
        if (isEditing) {
            editProfileBtn.textContent = 'Save';
            editProfileBtn.classList.remove('btn-outline');
            editProfileBtn.classList.add('btn-primary');
        }
    };

    editUsernameInput.addEventListener('input', handleInputChange);
    editPasswordInput.addEventListener('input', handleInputChange);
}

// Logout
const logoutBtn = document.getElementById('customer-logout-btn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
        sessionStorage.clear();
        window.location.href = 'login.html';
    });
}

let cart = [];

// Navigation logic
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        // Update active class
        document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
        e.target.classList.add('active');
        
        // Scroll to section
        const targetId = e.target.getAttribute('data-target');
        const targetSec = document.getElementById(targetId);
        
        // Account for sticky navbar height (approx 80px)
        const y = targetSec.getBoundingClientRect().top + window.scrollY - 100;
        window.scrollTo({top: y, behavior: 'smooth'});
    });
});

// Load Menu
async function loadMenu() {
    const products = await getProducts();
    const menuGrid = document.getElementById('menu-grid');
    menuGrid.replaceChildren(); // Safe clear

    products.forEach(product => {
        const card = document.createElement('div');
        card.className = 'product-card';

        const imgWrapper = document.createElement('div');
        imgWrapper.className = 'product-card-img-wrapper';

        const img = document.createElement('img');
        img.src = product.image;
        img.alt = product.name;

        imgWrapper.appendChild(img);

        const title = document.createElement('h3');
        title.textContent = product.name;

        const price = document.createElement('p');
        price.textContent = `LKR ${product.price}`;

        const btn = document.createElement('button');
        btn.className = 'btn btn-primary w-full mt-4';
        btn.textContent = 'Add to Cart';
        btn.onclick = () => addToCart(product);

        card.appendChild(imgWrapper);
        card.appendChild(title);
        card.appendChild(price);
        card.appendChild(btn);
        
        menuGrid.appendChild(card);
    });
}

function addToCart(product) {
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
        existing.qty += 1;
    } else {
        cart.push({ ...product, qty: 1 });
    }
    updateCartUI();
}

function removeFromCart(id) {
    cart = cart.filter(item => item.id !== id);
    updateCartUI();
}

function updateCartUI() {
    const cartCount = document.getElementById('cart-count');
    const cartItems = document.getElementById('cart-items');
    const cartTotal = document.getElementById('cart-total');
    const placeOrderBtn = document.getElementById('place-order-btn');

    cartCount.textContent = cart.reduce((sum, item) => sum + item.qty, 0);
    
    cartItems.replaceChildren(); // safe clear
    
    let total = 0;

    if (cart.length === 0) {
        const p = document.createElement('p');
        p.className = 'text-muted';
        p.textContent = 'Your cart is empty.';
        cartItems.appendChild(p);
        if(placeOrderBtn) placeOrderBtn.disabled = true;
    } else {
        if(placeOrderBtn) placeOrderBtn.disabled = false;
        cart.forEach(item => {
            const itemTotal = item.price * item.qty;
            total += itemTotal;

            const div = document.createElement('div');
            div.className = 'flex justify-between items-center p-4';
            div.style.borderBottom = '1px solid var(--border-color)';

            const textDiv = document.createElement('div');
            const name = document.createElement('h4');
            name.textContent = item.name;
            const details = document.createElement('p');
            details.className = 'text-muted';
            details.textContent = `${item.qty} x LKR ${item.price}`;
            
            textDiv.appendChild(name);
            textDiv.appendChild(details);

            const removeBtn = document.createElement('button');
            removeBtn.className = 'btn btn-outline';
            removeBtn.style.padding = '4px 8px';
            removeBtn.textContent = 'X';
            removeBtn.onclick = () => removeFromCart(item.id);

            div.appendChild(textDiv);
            div.appendChild(removeBtn);
            cartItems.appendChild(div);
        });
    }

    cartTotal.textContent = total;

    // Enable/disable place order button based on cart length
    const openPaymentBtn = document.getElementById('open-payment-btn');
    if (openPaymentBtn) {
        openPaymentBtn.disabled = cart.length === 0;
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadMenu();
    updateCartUI();

    const placeOrderBtn = document.getElementById('place-order-btn');
    if (placeOrderBtn) {
        placeOrderBtn.addEventListener('click', async () => {
            if (cart.length === 0) return;
            
            try {
                placeOrderBtn.textContent = 'Processing...';
                placeOrderBtn.disabled = true;
                
                const snipcartItems = cart.map(item => ({
                    id: String(item.id), // ID must be a string
                    name: item.name,
                    price: parseFloat(item.price),
                    url: '/', // Use root for local testing/validation
                    quantity: parseInt(item.qty),
                    image: item.image,
                    description: item.description || ''
                }));
                
                // Add items one by one to ensure it works across all Snipcart v3 minor versions
                for (const item of snipcartItems) {
                    await Snipcart.api.cart.items.add(item);
                }
                
                Snipcart.api.theme.cart.open();
                
                // Reset UI
                placeOrderBtn.textContent = 'Pay via Snipcart';
                placeOrderBtn.disabled = false;
                
            } catch (error) {
                console.error("Snipcart Error:", error);
                alert("Failed to load Snipcart payment gateway.");
                placeOrderBtn.textContent = 'Pay via Snipcart';
                placeOrderBtn.disabled = false;
            }
        });
    }
});

// Polling for Order Confirmations (Simulating real-time notification)
setInterval(async () => {
    const currentOrders = await getOrders();
    if(currentOrders.length > 0) {
        // Check if any order was recently confirmed
        const latestOrder = currentOrders[0]; // because getOrders sorts by date desc
        // If it's a new confirmed status we haven't seen in this session (naive check for prototype)
        if(latestOrder && latestOrder.status === 'confirmed' && !sessionStorage.getItem(`notified-${latestOrder.id}`)) {
            const notif = document.getElementById('customer-notification');
            document.getElementById('notif-order-id').textContent = latestOrder.id;
            notif.style.display = 'block';
            sessionStorage.setItem(`notified-${latestOrder.id}`, 'true');
            
            setTimeout(() => {
                notif.style.display = 'none';
            }, 5000);
        }
    }
}, 5000);

// Init
window.onload = () => {
    loadMenu();
};
