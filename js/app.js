// Customer Application Logic

// Auth Check (Customer only pages)
if (window.location.pathname.endsWith('customer.html')) {
    if (sessionStorage.getItem('customerAuth') !== 'true') {
        window.location.href = 'index.html';
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
    profileBtn.addEventListener('click', () => {
        profileSidebar.classList.add('active');
        profileOverlay.style.display = 'flex';
        setTimeout(() => profileOverlay.classList.add('active'), 10);
    });
}

if (closeProfileBtn) {
    const closeProfile = () => {
        profileSidebar.classList.remove('active');
        profileOverlay.classList.remove('active');
        setTimeout(() => profileOverlay.style.display = 'none', 300);
    };
    closeProfileBtn.addEventListener('click', closeProfile);
    profileOverlay.addEventListener('click', closeProfile);
}

// Logout
const logoutBtn = document.getElementById('customer-logout-btn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
        sessionStorage.clear();
        window.location.href = 'index.html';
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
function loadMenu() {
    const products = getProducts();
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
        placeOrderBtn.addEventListener('click', () => {
            const selectedMethod = document.querySelector('input[name="pay_method"]:checked').value;
            const total = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
            
            const customerEmail = sessionStorage.getItem('customerEmail') || 'User@guest.com';
            const customerName = customerEmail.split('@')[0];
            
            let masked = '****';
            if(selectedMethod === 'Credit Card') masked = '****-****-****-6006';
            if(selectedMethod === 'Paypal') masked = 'paypal-5221';
            if(selectedMethod === 'Google Pay') masked = 'gpay-4142';

            placeOrder(customerName, cart, total, selectedMethod, masked);

            cart = [];
            updateCartUI();

            document.getElementById('order-success-modal').classList.add('active');
        });
    }
});

// Polling for Order Confirmations (Simulating real-time notification)
let lastOrderCount = getOrders().length;
setInterval(() => {
    const currentOrders = getOrders();
    if(currentOrders.length > 0) {
        // Check if any order was recently confirmed
        const latestOrder = currentOrders[currentOrders.length - 1];
        // If it's a new confirmed status we haven't seen in this session (naive check for prototype)
        if(latestOrder.status === 'confirmed' && !sessionStorage.getItem(`notified-${latestOrder.id}`)) {
            const notif = document.getElementById('customer-notification');
            document.getElementById('notif-order-id').textContent = latestOrder.id;
            notif.style.display = 'block';
            sessionStorage.setItem(`notified-${latestOrder.id}`, 'true');
            
            setTimeout(() => {
                notif.style.display = 'none';
            }, 5000);
        }
    }
}, 2000);

// Init
window.onload = () => {
    loadMenu();
};
