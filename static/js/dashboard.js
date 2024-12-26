// Fetch and populate metrics
fetch('/api/dashboard_data')
    .then(response => response.json())
    .then(data => {
        document.getElementById('total-patients').textContent = data.total_patients;
        document.getElementById('total-medicines').textContent = data.total_medicines;
        document.getElementById('total-profit').textContent = data.total_sales.toFixed(2);
        document.getElementById('out-of-stock').textContent = data.out_of_stock;
    });

// Fetch and display expiring medicines
fetch('/api/expiring_medicines')
    .then(response => response.json())
    .then(data => {
        const list = document.getElementById('expiring-medicines');
        data.forEach(item => {
            const li = document.createElement('li');
            li.textContent = `${item.name} (Expires: ${item.expiration_date}, Quantity: ${item.quantity})`;
            list.appendChild(li);
        });
    });

// Fetch and display recent sales
fetch('/api/recent_sales')
    .then(response => response.json())
    .then(data => {
        const list = document.getElementById('recent-sales');
        data.forEach(item => {
            const li = document.createElement('li');
            li.textContent = `${item.patient_name} bought ${item.quantity} of ${item.medicine_name} on ${item.sale_date}`;
            list.appendChild(li);
        });
    });

fetch('/api/customer_count') // Replace '/api/customer_count' with your actual API endpoint
    .then(response => response.json())
    .then(data => {
      document.getElementById('customerCount').textContent = data.count; 
    })
    .catch(error => {
      console.error('Error fetching customer count:', error);
      document.getElementById('customerCount').textContent = 'Error'; 
    });

// Example Chart.js chart
const ctx = document.getElementById('salesChart').getContext('2d');
fetch('/api/dashboard_data')
    .then(response => response.json())
    .then(data => {
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Patients', 'Medicines', 'Sales', 'Out of Stock'],
                datasets: [{
                    label: 'Dashboard Metrics',
                    data: [data.total_patients, data.total_medicines, data.total_sales, data.out_of_stock],
                    backgroundColor: ['blue', 'green', 'orange', 'red']
                }]
            }
        });
    });
