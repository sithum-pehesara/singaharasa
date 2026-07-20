// Admin Application Logic

// Mock Auth State
let isAdminLoggedIn = sessionStorage.getItem('adminAuth') === 'true';

// DOM Elements
// Auth Check on load
function checkAuth() {
    if (!isAdminLoggedIn) {
        window.location.href = 'index.html';
    } else {
        initDashboard();
    }
}

// Logout
document.getElementById('logout-btn').addEventListener('click', () => {
    sessionStorage.removeItem('adminAuth');
    isAdminLoggedIn = false;
    window.location.href = 'index.html';
});

// Navigation
document.querySelectorAll('.admin-nav-item').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        document.querySelectorAll('.admin-nav-item').forEach(l => l.classList.remove('active'));
        e.target.classList.add('active');
        
        const targetId = e.target.getAttribute('data-tab');
        document.querySelectorAll('.dashboard-section').forEach(sec => {
            sec.style.display = 'none';
            sec.classList.remove('fade-in');
        });
        
        const targetSec = document.getElementById(targetId + '-tab');
        targetSec.style.display = 'block';
        if(targetId === 'sales') {
            renderSalesList();
            // Default to list view
            document.getElementById('sales-list').style.display = 'block';
            document.getElementById('sales-graph').style.display = 'none';
            document.querySelectorAll('.tab-btn').forEach(b => {
                b.classList.remove('btn-primary');
                b.classList.add('btn-outline');
            });
            const firstTab = document.querySelector('.tab-btn[data-subtab="sales-list"]');
            if(firstTab) {
                firstTab.classList.remove('btn-outline');
                firstTab.classList.add('btn-primary');
            }
        }
        if(targetId === 'orders') renderOrders();
    });
});

// Sales Subtabs Logic
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        // Handle styling
        document.querySelectorAll('.tab-btn').forEach(b => {
            b.classList.remove('btn-primary', 'active');
            b.classList.add('btn-outline');
        });
        e.target.classList.remove('btn-outline');
        e.target.classList.add('btn-primary', 'active');

        // Handle visibility
        document.querySelectorAll('.sub-section').forEach(sec => sec.style.display = 'none');
        document.getElementById(e.target.getAttribute('data-subtab')).style.display = 'block';

        if(e.target.getAttribute('data-subtab') === 'sales-graph') {
            renderGraph();
        }
    });
});




// ==========================================
// CASHIER POS LOGIC
// ==========================================
let posBill = [];
let calculatorInput = "";

function loadPOSItems() {
    const products = getProducts();
    const grid = document.getElementById('pos-items-grid');
    grid.replaceChildren();

    products.forEach(p => {
        const div = document.createElement('div');
        div.className = 'card flex-col items-center justify-center';
        div.style.cursor = 'pointer';
        div.style.textAlign = 'center';
        div.style.padding = '1rem';
        
        const title = document.createElement('h4');
        title.textContent = p.name;
        
        const price = document.createElement('p');
        price.className = 'text-muted';
        price.textContent = `LKR ${p.price}`;

        div.appendChild(title);
        div.appendChild(price);
        
        div.onclick = () => addToPOS(p);
        grid.appendChild(div);
    });
}

function addToPOS(product) {
    const existing = posBill.find(i => i.id === product.id);
    if(existing) {
        existing.qty += 1;
    } else {
        posBill.push({...product, qty: 1});
    }
    renderPOSBill();
}

function renderPOSBill() {
    const container = document.getElementById('pos-bill-items');
    container.replaceChildren();

    if(posBill.length === 0) {
        const p = document.createElement('p');
        p.className = 'text-muted';
        p.style.textAlign = 'center';
        p.textContent = 'No items added.';
        container.appendChild(p);
        document.getElementById('pos-total').textContent = '0';
        return;
    }

    let total = 0;
    posBill.forEach((item, index) => {
        total += item.price * item.qty;
        
        const row = document.createElement('div');
        row.style.display = 'flex';
        row.style.justifyContent = 'space-between';
        row.style.marginBottom = '0.5rem';
        row.style.fontSize = '0.9rem';

        const text = document.createElement('span');
        text.textContent = `${item.name} (x${item.qty})`;

        const price = document.createElement('span');
        price.textContent = `LKR ${item.price * item.qty}`;

        // Double click to remove (simple UX for prototype)
        row.ondblclick = () => {
            posBill.splice(index, 1);
            renderPOSBill();
        };

        row.appendChild(text);
        row.appendChild(price);
        container.appendChild(row);
    });

    document.getElementById('pos-total').textContent = total;
    const payBtnAmount = document.getElementById('pay-btn-amount');
    if(payBtnAmount) payBtnAmount.textContent = total;
}

// Clear Bill Button
document.getElementById('clear-bill-btn').addEventListener('click', () => {
    posBill = [];
    renderPOSBill();
});

// Calculator Logic
const calcDisplay = document.getElementById('calc-display');
document.querySelectorAll('.calc-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const val = e.target.getAttribute('data-val');
        if (val === 'clear') {
            calculatorInput = "";
        } else {
            calculatorInput += val;
        }
        if(calcDisplay) calcDisplay.value = calculatorInput ? 'LKR ' + calculatorInput : '';
    });
});

document.getElementById('pos-pay-btn').addEventListener('click', () => {
    if(posBill.length === 0) return;
    const total = parseInt(document.getElementById('pos-total').textContent);
    
    // Save to sales
    const sales = getSales();
    sales.push({
        date: new Date().toISOString(),
        total: total,
        orderId: 'POS-' + Math.floor(Math.random()*1000)
    });
    localStorage.setItem('sales', JSON.stringify(sales));

    // Update stock
    posBill.forEach(item => updateProductStock(item.id, -item.qty));

    posBill = [];
    calculatorInput = "";
    if(calcDisplay) calcDisplay.value = "";
    renderPOSBill();
    // Re-render other tabs if needed
});

// ==========================================
// SALES LOGIC
// ==========================================
// Populate Month Filters
function populateMonthFilters() {
    const salesFilter = document.getElementById('sales-month-filter');
    const graphFilter = document.getElementById('graph-month-filter');
    
    // Keep 'All Months' in salesFilter
    salesFilter.innerHTML = '<option value="">All Months</option>';
    graphFilter.innerHTML = ''; // Graph needs a specific month
    
    const now = new Date();
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    
    for(let i=0; i<6; i++) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const valStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        const displayStr = `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
        
        salesFilter.innerHTML += `<option value="${valStr}">${displayStr}</option>`;
        graphFilter.innerHTML += `<option value="${valStr}">${displayStr}</option>`;
    }
}

function renderSalesList() {
    const sales = getSales();
    const tbody = document.getElementById('sales-table-body');
    tbody.replaceChildren();

    const searchTerm = document.getElementById('sales-search').value.toLowerCase();
    const monthFilter = document.getElementById('sales-month-filter').value; // YYYY-MM

    let filtered = sales.filter(s => {
        const matchSearch = s.orderId ? s.orderId.toLowerCase().includes(searchTerm) : true;
        let matchMonth = true;
        if(monthFilter) {
            const d = new Date(s.date);
            const saleMonth = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            matchMonth = saleMonth === monthFilter;
        }
        return matchSearch && matchMonth;
    });

    // Sort descending
    filtered.sort((a,b) => new Date(b.date) - new Date(a.date));

    filtered.forEach(s => {
        const tr = document.createElement('tr');
        
        const tdDate = document.createElement('td');
        tdDate.textContent = new Date(s.date).toLocaleDateString();
        
        const tdId = document.createElement('td');
        tdId.textContent = s.orderId || 'N/A';
        
        const tdTotal = document.createElement('td');
        tdTotal.textContent = s.total;

        tr.appendChild(tdDate);
        tr.appendChild(tdId);
        tr.appendChild(tdTotal);
        tbody.appendChild(tr);
    });
}

document.getElementById('sales-search').addEventListener('input', renderSalesList);
document.getElementById('sales-month-filter').addEventListener('change', renderSalesList);

let chartInstance = null;
function renderGraph() {
    const ctx = document.getElementById('salesChart').getContext('2d');
    const sales = getSales();
    const monthFilter = document.getElementById('graph-month-filter').value;
    
    // Safely calculate current and previous month in local time
    const now = new Date();
    let currentMonthStr = monthFilter;
    if (!currentMonthStr) {
        currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    }

    const [yearStr, monthStr] = currentMonthStr.split('-');
    const year = parseInt(yearStr);
    const monthIndex = parseInt(monthStr) - 1; // 0-11
    
    let prevYear = year;
    let prevMonthIndex = monthIndex - 1;
    if (prevMonthIndex < 0) {
        prevMonthIndex = 11;
        prevYear -= 1;
    }
    const prevMonthStr = `${prevYear}-${String(prevMonthIndex + 1).padStart(2, '0')}`;

    // Aggregate by day (1-31)
    const currentMonthData = new Array(31).fill(0);
    const prevMonthData = new Array(31).fill(0);

    sales.forEach(s => {
        const d = new Date(s.date);
        const sYear = d.getFullYear();
        const sMonthIndex = d.getMonth();
        const sDay = d.getDate() - 1; // 0-indexed for array

        if(sYear === year && sMonthIndex === monthIndex) {
            currentMonthData[sDay] += s.total;
        } else if(sYear === prevYear && sMonthIndex === prevMonthIndex) {
            prevMonthData[sDay] += s.total;
        }
    });

    const labels = Array.from({length: 31}, (_, i) => i + 1);

    if(chartInstance) {
        chartInstance.destroy();
    }

    chartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: `Current Month (${currentMonthStr})`,
                    data: currentMonthData,
                    borderColor: '#4a90e2', // Blue line as requested
                    backgroundColor: 'rgba(74, 144, 226, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.3
                },
                {
                    label: `Previous Month (${prevMonthStr})`,
                    data: prevMonthData,
                    borderColor: '#999999', // Dotted line
                    borderDash: [5, 5],
                    borderWidth: 2,
                    fill: false,
                    tension: 0.3
                }
            ]
        },
        options: {
            responsive: true,
            scales: {
                y: { beginAtZero: true }
            }
        }
    });
}
document.getElementById('graph-month-filter').addEventListener('change', renderGraph);

// ==========================================
// ORDERS LOGIC
// ==========================================
let pendingOrderActionId = null;

function renderOrders() {
    const orders = getOrders();
    const tbody = document.getElementById('orders-table-body');
    tbody.replaceChildren();

    // Sort descending
    orders.sort((a,b) => new Date(b.date) - new Date(a.date));
    
    let pendingCount = 0;

    orders.forEach(o => {
        if(o.status === 'pending') pendingCount++;

        const tr = document.createElement('tr');
        
        const tdId = document.createElement('td');
        tdId.textContent = o.id;

        const tdCust = document.createElement('td');
        tdCust.textContent = o.customerName;

        const tdItems = document.createElement('td');
        tdItems.textContent = o.items.map(i => `${i.name}(${i.qty})`).join(', ');

        const tdTotal = document.createElement('td');
        tdTotal.textContent = `LKR ${o.total}`;

        const tdStatus = document.createElement('td');
        const span = document.createElement('span');
        span.className = `badge badge-${o.status}`;
        span.textContent = o.status;
        tdStatus.appendChild(span);

        const tdAction = document.createElement('td');
        if(o.status === 'pending') {
            const btn = document.createElement('button');
            btn.className = 'btn btn-primary';
            btn.style.padding = '4px 8px';
            btn.textContent = 'Confirm';
            btn.onclick = () => showConfirmDialog(o.id);
            tdAction.appendChild(btn);
        } else {
            tdAction.textContent = '-';
        }

        tr.appendChild(tdId);
        tr.appendChild(tdCust);
        tr.appendChild(tdItems);
        tr.appendChild(tdTotal);
        tr.appendChild(tdStatus);
        tr.appendChild(tdAction);
        
        tbody.appendChild(tr);
    });

    const badge = document.getElementById('pending-orders-badge');
    if(pendingCount > 0) {
        badge.style.display = 'inline-block';
        badge.textContent = pendingCount;
    } else {
        badge.style.display = 'none';
    }
}

function showConfirmDialog(orderId) {
    pendingOrderActionId = orderId;
    document.getElementById('confirm-msg').textContent = `Confirm order ${orderId}?`;
    document.getElementById('confirm-modal').classList.add('active');
}

document.getElementById('confirm-yes').addEventListener('click', () => {
    if(pendingOrderActionId) {
        confirmOrder(pendingOrderActionId);
        pendingOrderActionId = null;
        document.getElementById('confirm-modal').classList.remove('active');
        renderOrders();
        checkNotifications(); // Refresh notifs
    }
});
document.getElementById('confirm-no').addEventListener('click', () => {
    pendingOrderActionId = null;
    document.getElementById('confirm-modal').classList.remove('active');
});

// ==========================================
// NOTIFICATIONS LOGIC
// ==========================================
let notifs = [];

function checkNotifications() {
    notifs = [];
    
    // Check pending orders
    const orders = getOrders();
    const pending = orders.filter(o => o.status === 'pending');
    if(pending.length > 0) {
        notifs.push(`${pending.length} new pending orders require confirmation.`);
    }

    // Check low stock
    const products = getProducts();
    products.forEach(p => {
        if(p.stock < 10) {
            notifs.push(`Low Stock Alert: ${p.name} (Only ${p.stock} left)`);
        }
    });

    updateNotifUI();
}

function updateNotifUI() {
    const badge = document.getElementById('notif-count');
    const list = document.getElementById('notif-list');
    list.replaceChildren();

    if(notifs.length > 0) {
        badge.style.display = 'inline-block';
        badge.textContent = notifs.length;
        
        notifs.forEach(n => {
            const li = document.createElement('li');
            li.style.borderBottom = '1px solid var(--border-color)';
            li.style.paddingBottom = '4px';
            li.textContent = n;
            list.appendChild(li);
        });
    } else {
        badge.style.display = 'none';
        const li = document.createElement('li');
        li.className = 'text-muted';
        li.textContent = 'No new notifications';
        list.appendChild(li);
    }
}

document.getElementById('notif-btn').addEventListener('click', () => {
    const panel = document.getElementById('notif-panel');
    panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
});

// Polling for updates
setInterval(() => {
    if(isAdminLoggedIn) {
        checkNotifications();
        // If on orders tab, soft refresh badge (and maybe table)
        if(document.getElementById('orders-tab').style.display === 'block') {
            renderOrders();
        }
    }
}, 5000);

// Init
function initDashboard() {
    populateMonthFilters();
    loadPOSItems();
    checkNotifications();
}

// Initial check
checkAuth();
