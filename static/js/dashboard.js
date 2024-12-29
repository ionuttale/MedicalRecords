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
        const tbody = document.getElementById('medicine-list'); // Target table body
        data.forEach(item => {
            const row = document.createElement('tr'); // Create a new table row

            // Add table cells for each data field
            row.innerHTML = `
                <td>${item.name}</td>
                <td>${item.expiration_date}</td>
                <td>${item.quantity}</td>
            `;

            // Append the row to the table body
            tbody.appendChild(row);
        });
    })
    .catch(error => {
        console.error('Error fetching data:', error);
    });

// Fetch and display recent sales
fetch('/api/recent_sales')
    .then(response => response.json())
        .then(data => {
            const tbody = document.getElementById('recent-sales'); // Target table body
            data.forEach(item => {
                const row = document.createElement('tr'); // Create a new table row
    
                // Add table cells for each data field
                row.innerHTML = `
                    <td>${item.medicine_name}</td>
                    <td>${item.patient_name}</td>
                    <td>${item.quantity}</td>
                    <td>${item.sale_date}</td>
                    <td>${item.total_price.toFixed(2)}<span class="euro-symbol">€</span></td>
                `;
    
                // Append the row to the table body
                tbody.appendChild(row);
            });
        })
        .catch(error => {
            console.error('Error fetching data:', error);
    });
    
    document.addEventListener('DOMContentLoaded', function () {
        // Fetch the monthly income data
        fetch('/api/get_monthly_income')
            .then(response => response.json())  // Parse the JSON response
            .then(data => {
                console.log('Data received from backend:', data);
    
                // Get the current month and year
                const currentDate = new Date();
                const currentMonth = currentDate.getMonth();  // 0-based (0 = January, 11 = December)
                const currentYear = currentDate.getFullYear();
    
                // Generate the months for the last 12 months, with the current month as the last
                const monthNames = [];
                for (let i = 0; i < 12; i++) {
                    const monthIndex = (currentMonth - i + 12) % 12;  // Adjust month to 0-11
                    const year = (currentMonth - i < 0) ? currentYear - 1 : currentYear;  // Adjust year if needed
                    const formattedMonth = `${year}-${String(monthIndex + 1).padStart(2, '0')}`;  // Format 'YYYY-MM'
                    monthNames.unshift(formattedMonth);  // Add month to the start of the array
                }
    
                // Prepare monthlyIncome with 0 for each month in the last 12 months
                const monthlyIncome = monthNames.reduce((acc, month) => {
                    acc[month] = 0;  // Set initial income to 0 for each month
                    return acc;
                }, {});
    
                // Ensure the data returned by the API is in the expected format
                // (Assuming the API returns months and income in arrays)
                if (data.months && data.income) {
                    // Accumulate the income for each month using the data returned from the API
                    data.months.forEach((month, index) => {
                        if (monthNames.includes(month)) {
                            monthlyIncome[month] = data.income[index];  // Set the income for the corresponding month
                        }
                    });
                } else {
                    console.error('API response missing "months" or "income" data.');
                }
    
                // Now, extract the months and corresponding income values
                const months = monthNames;
                const income = months.map(month => monthlyIncome[month]);
    
                console.log('Months:', months);
                console.log('Income:', income);
    
                // Create the chart
                const ctx = document.getElementById('incomeChart').getContext('2d');
                const incomeChart = new Chart(ctx, {
                    type: 'bar',  // Bar chart type
                    data: {
                        labels: months,  // X-axis labels (months)
                        datasets: [{
                            label: 'Monthly Income (€)',  // Label for the dataset
                            data: income,  // Y-axis data (income for the last 12 months)
                            backgroundColor: '#2f774e',  // Bar color
                            borderColor: '#2f774e',  // Border color of bars
                            borderWidth: 1  // Border width for bars
                        }]
                    },
                    options: {
                        scales: {
                            y: {
                                beginAtZero: true,  // Ensure the Y-axis starts at zero
                                title: {
                                    display: true,
                                    text: 'Income (€)'  // Y-axis title
                                }
                            }
                        }
                    }
                });
            })
            .catch(error => {
                console.error('Error fetching data:', error);  // Handle errors
            });
    });
    
function sortTable(tableId, columnIndex) {
    const table = document.getElementById(tableId); // Select the specific table by ID
    const tbody = table.querySelector('tbody'); // Select the table body
    const rows = Array.from(tbody.querySelectorAll('tr')); // Convert rows to an array
    
    // Determine sort direction based on the table's data-sortOrder attribute
    const isAscending = table.dataset.sortOrder !== 'asc';
    table.dataset.sortOrder = isAscending ? 'asc' : 'desc';

    // Sort rows based on the selected column's text content
    rows.sort((a, b) => {
        const cellA = a.cells[columnIndex].textContent.trim();
        const cellB = b.cells[columnIndex].textContent.trim();
        
        if (columnIndex == 4) {
            // Remove non-numeric characters (like the Euro symbol) and convert to float
            const priceA = parseFloat(cellA.replace('€', '').trim());
            const priceB = parseFloat(cellB.replace('€', '').trim());
    
            return isAscending ? priceA - priceB : priceB - priceA;
        }

        // Sort numerically if both cells are numbers
        if (!isNaN(cellA) && !isNaN(cellB)) {
            return isAscending ? cellA - cellB : cellB - cellA;
        }
    
        // Sort alphabetically for text
        return isAscending
            ? cellA.localeCompare(cellB)
            : cellB.localeCompare(cellA);
    });
    
    // Append the sorted rows back to the tbody
    rows.forEach(row => tbody.appendChild(row));
}
    
    



