// Firebase Data Operations
// Uses the 'db' variable initialized in firebase-init.js

const PRODUCTS = [
    { id: 1, name: 'Standard Pastry Sheet 500g', price: 350, stock: 150, image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&q=80' },
    { id: 2, name: 'Large Pastry Sheet 1kg', price: 650, stock: 80, image: 'https://images.unsplash.com/photo-1608198093002-ad4e005484ec?w=400&q=80' },
    { id: 5, name: 'Chocolate Danish', price: 900, stock: 60, image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400&q=80' },
    { id: 6, name: 'Artisan Bread Loaf', price: 550, stock: 30, image: 'https://images.unsplash.com/photo-1549931319-a545dcf3bc73?w=400&q=80' },
    { id: 8, name: 'Strawberry Tart', price: 1100, stock: 25, image: 'https://images.unsplash.com/photo-1550617931-e17a7b70dce2?w=400&q=80' },
    { id: 9, name: 'Almond Croissant', price: 1300, stock: 40, image: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=400&q=80' }
];

async function seedProductsIfNeeded() {
    // Temporary bypass for demo
    console.log("Mocking data, no Firebase seed needed.");
}
seedProductsIfNeeded();

async function getProducts() {
    // Temporary bypass for demo
    return PRODUCTS;
}

async function updateProductStock(id, qtyChange) {
    // Temporary bypass for demo
    console.log(`Mock: Updated stock for ${id} by ${qtyChange}`);
}

async function placeOrder(customerName, items, total, paymentType, ccMasked) {
    // Temporary bypass for demo
    const newOrder = {
        id: 'ORD-' + Math.floor(Math.random() * 10000),
        customerName,
        items,
        total,
        paymentType,
        ccMasked,
        status: 'pending',
        date: new Date().toISOString()
    };
    console.log("Mock: Placed order", newOrder);
    return newOrder;
}

async function getOrders() {
    // Temporary bypass for demo
    return [
        {
            id: 'ORD-1024',
            customerName: 'Saman Perera',
            items: [{ name: 'Standard Pastry Sheet 500g', qty: 2, price: 350 }],
            total: 700,
            paymentType: 'card',
            ccMasked: '****-****-****-4242',
            status: 'pending',
            date: new Date().toISOString()
        }
    ];
}

async function confirmOrder(orderId) {
    // Temporary bypass for demo
    console.log(`Mock: Confirmed order ${orderId}`);
}

async function getSales() {
    // Temporary bypass for demo
    return [
        {
            orderId: 'ORD-0999',
            total: 1300,
            date: new Date(Date.now() - 86400000).toISOString()
        }
    ];
}

// Utility to mask credit cards (Security Requirement)
function maskCreditCard(cardNumber) {
    // Only keep last 4 digits
    if (!cardNumber) return '';
    const cleanStr = cardNumber.replace(/\D/g, '');
    if (cleanStr.length < 4) return '***';
    return `****-****-****-${cleanStr.slice(-4)}`;
}

// Utility for safe text insertion (Security Requirement to prevent XSS)
function safeSetText(element, text) {
    element.textContent = text;
}

async function getUsers() {
    // Temporary bypass for demo
    return [
        { id: '1', name: 'Admin', email: 'admin@gmail.com', role: 'admin' },
        { id: '2', name: 'User', email: 'user@gmail.com', role: 'customer' }
    ];
}
