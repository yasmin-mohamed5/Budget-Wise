const API_URL = '/transactions';
let categories = [];

async function fetchCategories() {
    try {
        const response = await fetch(`${API_URL}/categories`, {
            credentials: 'include'
        });
        const result = await response.json();
        if (result.data) {
            categories = result.data;
            populateCategorySelects();
        }
    } catch (error) {
        console.error('Error fetching categories:', error);
    }
}

function populateCategorySelects() {
    const transCatSelect = document.getElementById('trans-category');
    if (!transCatSelect) return;
    
    const type = document.getElementById('trans-type').value.toLowerCase();
    
    // Save current selection if any
    const currentVal = transCatSelect.value;
    
    transCatSelect.innerHTML = '<option value="">Select Category</option>';
    
    categories
        .filter(cat => cat.type === type)
        .forEach(cat => {
            const option = document.createElement('option');
            option.value = cat._id;
            option.textContent = cat.name + (cat.limit > 0 ? ` (Limit: $${cat.limit})` : '');
            transCatSelect.appendChild(option);
        });
        
    if (currentVal) transCatSelect.value = currentVal;
}

function toggleTransactionFields() {
    const type = document.getElementById('trans-type').value;
    const sourceInput = document.getElementById('trans-source');
    const catSelect = document.getElementById('trans-category');
    
    if (type === 'Income') {
        sourceInput.style.display = 'block';
        sourceInput.required = true;
        catSelect.required = false; 
    } else {
        sourceInput.style.display = 'none';
        sourceInput.required = false;
        catSelect.required = true;
    }
    populateCategorySelects();
}

async function fetchData() {
    const response = await fetch(API_URL, {
        credentials: 'include'
    });
    const result = await response.json();
    const display = document.getElementById('display-area');
    display.innerHTML = '';

    if (result.data && result.data.transactions) {
        result.data.transactions.forEach(t => {
            const div = document.createElement('div');
            div.className = `item ${t.type}`;
            const catName = t.category ? ` [${t.category.name}]` : '';
            div.innerHTML = `<strong>${t.type}:</strong> $${t.amount}${catName} - ${t.description || 'No description'}`;
            display.appendChild(div);
        });
    } else {
        display.innerHTML = '<p>No transactions found.</p>';
    }
}

// Handle Transaction Form
document.getElementById('transaction-form').onsubmit = async (e) => {
    e.preventDefault();
    const data = {
        amount: document.getElementById('trans-amount').value,
        type: document.getElementById('trans-type').value,
        description: document.getElementById('trans-desc').value,
        categoryId: document.getElementById('trans-category').value,
        source: document.getElementById('trans-source').value,
        date: new Date()
    };

    const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(data)
    });

    const result = await res.json();

    if (res.ok) {
        if (result.warning) {
            alert(result.warning); // Show popup alert if near limit
        } else {
            alert('Transaction added!');
        }
        fetchData();
        e.target.reset();
        toggleTransactionFields();
    } else {
        alert('Error: ' + (result.message || 'Error adding transaction'));
    }
};

// Handle Category Form
document.getElementById('category-form').onsubmit = async (e) => {
    e.preventDefault();
    const data = {
        name: document.getElementById('cat-name').value,
        type: document.getElementById('cat-type').value,
        limit: document.getElementById('cat-limit').value
    };

    const res = await fetch(`${API_URL}/categories`, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(data)
    });

    if (res.ok) {
        alert('Category created!');
        fetchCategories();
        e.target.reset();
    } else {
        const err = await res.json();
        alert('Error: ' + (err.message || 'Error creating category'));
    }
};