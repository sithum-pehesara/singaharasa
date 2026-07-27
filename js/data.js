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

// Helper to seed initial products if missing
async function seedProductsIfNeeded() {
    try {
        const snapshot = await db.collection('products').limit(1).get();
        if (snapshot.empty) {
            for (const p of PRODUCTS) {
                await db.collection('products').doc(p.id.toString()).set(p);
            }
        }
    } catch (e) {
        console.warn("Could not seed products. Firebase config might be missing.", e);
    }
}
seedProductsIfNeeded();

async function getProducts() {
    try {
        const snapshot = await db.collection('products').get();
        return snapshot.docs.map(doc => doc.data());
    } catch (e) {
        console.error("Error getting products:", e);
        return [];
    }
}

async function updateProductStock(id, qtyChange) {
    try {
        const docRef = db.collection('products').doc(id.toString());
        await db.runTransaction(async (transaction) => {
            const doc = await transaction.get(docRef);
            if (!doc.exists) return;
            const newStock = doc.data().stock + qtyChange;
            transaction.update(docRef, { stock: newStock });
        });
    } catch (e) {
        console.error("Error updating stock:", e);
    }
}

async function placeOrder(customerName, items, total, paymentType, ccMasked) {
    try {
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
        await db.collection('orders').doc(newOrder.id).set(newOrder);
        return newOrder;
    } catch (e) {
        console.error("Error placing order:", e);
        return null;
    }
}

async function getOrders() {
    try {
        const snapshot = await db.collection('orders').orderBy('date', 'desc').get();
        return snapshot.docs.map(doc => doc.data());
    } catch (e) {
        console.error("Error getting orders:", e);
        return [];
    }
}

async function confirmOrder(orderId) {
    try {
        const orderRef = db.collection('orders').doc(orderId);
        const orderDoc = await orderRef.get();
        
        if (orderDoc.exists && orderDoc.data().status !== 'confirmed') {
            const orderData = orderDoc.data();
            
            // Update order status
            await orderRef.update({ status: 'confirmed' });
            
            // Record Sale
            await db.collection('sales').add({
                date: new Date().toISOString(),
                total: orderData.total,
                orderId: orderId
            });
            
            // Decrease stock
            for (const item of orderData.items) {
                await updateProductStock(item.id, -item.qty);
            }
        }
    } catch (e) {
        console.error("Error confirming order:", e);
    }
}

async function getSales() {
    try {
        const snapshot = await db.collection('sales').orderBy('date', 'desc').get();
        return snapshot.docs.map(doc => doc.data());
    } catch (e) {
        console.error("Error getting sales:", e);
        return [];
    }
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
    try {
        const snapshot = await db.collection('users').orderBy('createdAt', 'desc').get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (e) {
        console.error("Error getting users:", e);
        return [];
    }
}
