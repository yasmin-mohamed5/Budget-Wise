const API = '/reports/generate';
const loginLink = document.getElementById('loginLink');
const registerLink = document.getElementById('registerLink');
const logoutLink = document.getElementById('logoutLink');
const userInfo = document.getElementById('userInfo');

var startDate = document.getElementById('startDate');
var endDate = document.getElementById('endDate');
var pattern = document.getElementById('pattern');
var patternError = document.getElementById('patternError');

if (token) {
    if (loginLink) loginLink.style.display = 'none';
    if (registerLink) registerLink.style.display = 'none';
    if (logoutLink) logoutLink.style.display = 'inline';
}

const userJson = localStorage.getItem('user');
if (userJson) {
    document.getElementById('loginLink').style.display = 'none';
    document.getElementById('registerLink').style.display = 'none';
    document.getElementById('logoutLink').style.display = 'inline';
    
    const user = JSON.parse(userJson);
    const info = document.getElementById('userInfo');
    info.textContent = `Welcome, ${user.name}`;
    info.style.display = 'inline';
} else if (window.location.pathname.includes('index.html')) {
        // Redirect to login if no user data (though server should handle cookie check)
        // window.location.href = 'login.html';
}

async function handleLogout() {
    try {
        await fetch('/auth/logout', { method: 'POST' });
        localStorage.removeItem('user');
        window.location.href = 'login.html';
    } catch (err) {
        console.error('Logout failed', err);
        localStorage.removeItem('user');
        window.location.href = 'login.html';
    }
}

// form inputs for date range

function generateReport(e) {
    console.log("here");
    
    e.preventDefault();
    patternError.textContent = ''; // Clear previous errors
    
    if(!endDate.value) {
        // Set to today's date
        endDate.value = new Date().toISOString().split('T')[0]; 
    }
    if(!startDate.value) {
        // Set to 30 days ago from end date
        const thirtyDaysAgo = endDate.value ? new Date(endDate.value) : new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        startDate.value = thirtyDaysAgo.toISOString().split('T')[0];
    }
    if(!pattern.value) {
        pattern.value = 'day'; // Default pattern
    }else if(pattern.value === 'month' && (new Date(endDate.value) - new Date(startDate.value)) < 30 * 24 * 60 * 60 * 1000) {
        patternError.textContent = 'Please select a date range of greater than 30 days for monthly pattern.';
        return;
    }

    // Display selected date range in report header
    let ReportStartDate = document.getElementById('ReportStartDate');
    let ReportEndDate = document.getElementById('ReportEndDate');
    ReportStartDate.textContent = startDate.value;
    ReportEndDate.textContent = endDate.value;

    document.getElementById('charts').style.display = 'block';
    document.getElementById('info').style.display = 'block';
    loadChart(startDate, endDate, pattern);
}


// Generate report based on form input
async function loadChart(startDate, endDate, pattern) {
    try {
        // Fetch report data 
        // GET method does not support body, so we pass dates as query parameters
        const response = await fetch(
            `${API}?startDate=${startDate.value}&endDate=${endDate.value}&pattern=${pattern.value}`,
            {
                method: 'GET',
                credentials: 'include',
                headers: {}
            }
        );

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || `HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        const reportData = result.data;

        // Display report information
        displayReportInfo(reportData);
        createIncomeExpenseChart(reportData);
        createSpendingPatternChart(reportData.spendingPattern);

        // Create chart
        createExpenseChart(reportData.categoryChart);

        // Show sections
        document.getElementById('info').style.display = 'block';
        document.getElementById('charts').style.display = 'block';

    } catch (error) {
        console.error('Error loading chart:', error);
        alert('Failed to generate report: ' + error.message);
    }
}

// Display report information
function displayReportInfo(reportData) {

    document.getElementById('totalIncome').textContent = `$${reportData.totalIncome.toFixed(2)}`;
    document.getElementById('totalExpenses').textContent = `$${reportData.totalExpenses.toFixed(2)}`;
    document.getElementById('netSavings').textContent = `$${(reportData.totalIncome - reportData.totalExpenses).toFixed(2)}`;

    // Category breakdown
    const categoryBreakdownHTML = reportData.expenseByCategory
        .map(cat => `
            <div>
                <strong>${cat.categoryName}</strong>: $${cat.totalAmount.toFixed(2)} (${cat.percentage.toFixed(1)}%)
            </div>
        `)
        .join('');
    
    document.getElementById('categoryBreakdown').innerHTML = categoryBreakdownHTML || 'No expenses in this period';
}

// Create expense breakdown chart
function createExpenseChart(chartData) {

    // Destroy existing chart if it exists
    if (window.myChartInstance) {
        window.myChartInstance.destroy();
    }

    const ctx = document.getElementById('myChart');

    window.myChartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: chartData.labels,
            datasets: [{
                label: 'Expenses by Category',
                data: chartData.values,

                // Dynamic colors
                backgroundColor: chartData.values.map(() =>
                    `hsl(${Math.random() * 360}, 70%, 60%)`
                ),

                borderColor: '#fff',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom'
                },
                title: {
                    display: true,
                    text: 'Expense Breakdown by Category'
                }
            }
        }
    });
}

function createIncomeExpenseChart(reportData) {

    // destroy old chart if exists
    if (window.incomeExpenseChartInstance) {
        window.incomeExpenseChartInstance.destroy();
    }

    const ctx = document.getElementById('incomeExpenseBarChart');

    window.incomeExpenseChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Income', 'Expenses'],
            datasets: [{
                label: 'Amount',
                data: [
                    reportData.totalIncome,
                    reportData.totalExpenses
                ],
                backgroundColor: [
                    'rgba(54, 162, 235, 0.7)',
                    'rgba(255, 99, 132, 0.7)'
                ],
                borderColor: [
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 99, 132, 1)'
                ],
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: 'Income vs Expenses'
                }
            }
        }
    });
}

function createSpendingPatternChart(spendingPattern) {

    if (window.spendingChartInstance) {
        window.spendingChartInstance.destroy();
    }

    const ctx = document.getElementById('spendingPatternChart');

    window.spendingChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: spendingPattern.map(p => 
                `${p.period.year}-${p.period.month || p.period.week || p.period.day}`
            ),
            datasets: [{
                label: 'Spending Over Time',
                data: spendingPattern.map(p => p.totalSpent),
                borderColor: 'rgba(255, 99, 132, 1)',
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                tension: 0.3,
                fill: true
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Spending Pattern Over Time'
                }
            }
        }
    });
}