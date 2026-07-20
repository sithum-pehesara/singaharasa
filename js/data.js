// Mock Data and Shared State (For Prototype purposes only)
// Security note: In a real app, do not store sensitive auth data in localStorage.

const PRODUCTS = [
    { id: 1, name: 'Standard Pastry Sheet 500g', price: 350, stock: 150, image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&q=80' },
    { id: 2, name: 'Large Pastry Sheet 1kg', price: 650, stock: 80, image: 'https://images.unsplash.com/photo-1608198093002-ad4e005484ec?w=400&q=80' },
    { id: 5, name: 'Chocolate Danish', price: 900, stock: 60, image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400&q=80' },
    { id: 6, name: 'Artisan Bread Loaf', price: 550, stock: 30, image: 'https://images.unsplash.com/photo-1549931319-a545dcf3bc73?w=400&q=80' },
    { id: 8, name: 'Strawberry Tart', price: 1100, stock: 25, image: 'https://images.unsplash.com/photo-1550617931-e17a7b70dce2?w=400&q=80' },
    { id: 9, name: 'Almond Croissant', price: 1300, stock: 40, image: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=400&q=80' }
];

// Always update local storage during development to reflect new items
localStorage.setItem('products', JSON.stringify(PRODUCTS));

if (!localStorage.getItem('orders')) {
    localStorage.setItem('orders', JSON.stringify([]));
}
if (!localStorage.getItem('sales_v2_generated')) {
    // Generate some mock historical sales data for the graph for the last 6 months
    const mockSales = JSON.parse(localStorage.getItem('sales') || '[]');
    const now = new Date();
    
    // Generate for the last 6 months (0 to 5)
    for (let m = 0; m < 6; m++) {
        for(let i = 1; i <= 28; i++) {
            if(Math.random() > 0.5) {
                mockSales.push({ 
                    date: new Date(now.getFullYear(), now.getMonth() - m, i).toISOString(), 
                    total: Math.floor(Math.random() * 5000) + 1000 
                });
            }
        }
    }
    localStorage.setItem('sales', JSON.stringify(mockSales));
    localStorage.setItem('sales_v2_generated', 'true');
}

function getProducts() {
    return JSON.parse(localStorage.getItem('products') || '[]');
}

function updateProductStock(id, qtyChange) {
    const products = getProducts();
    const product = products.find(p => p.id === id);
    if (product) {
        product.stock += qtyChange;
        localStorage.setItem('products', JSON.stringify(products));
    }
}

function placeOrder(customerName, items, total, paymentType, ccMasked) {
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
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
    orders.push(newOrder);
    localStorage.setItem('orders', JSON.stringify(orders));
    return newOrder;
}

function getOrders() {
    return JSON.parse(localStorage.getItem('orders') || '[]');
}

function confirmOrder(orderId) {
    const orders = getOrders();
    const orderIndex = orders.findIndex(o => o.id === orderId);
    if (orderIndex > -1) {
        orders[orderIndex].status = 'confirmed';
        localStorage.setItem('orders', JSON.stringify(orders));
        
        // Also add to sales
        const sales = JSON.parse(localStorage.getItem('sales') || '[]');
        sales.push({
            date: new Date().toISOString(),
            total: orders[orderIndex].total,
            orderId: orderId
        });
        localStorage.setItem('sales', JSON.stringify(sales));
        
        // Decrease stock
        orders[orderIndex].items.forEach(item => {
            updateProductStock(item.id, -item.qty);
        });
    }
}

function getSales() {
    return JSON.parse(localStorage.getItem('sales') || '[]');
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
