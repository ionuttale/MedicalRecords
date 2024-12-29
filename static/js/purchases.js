document.addEventListener("DOMContentLoaded", function() {
    // Fetch the recent purchases data
    fetch('/api/get-purchases')
        .then(response => response.json())  // Parse JSON data
        .then(data => {
            // Call function to populate the table with fetched data
            populateTable(data);
        })
        .catch(error => console.error("Error fetching data:", error));

    function populateTable(data) {
        const tbody = document.getElementById("recent-sales"); // Get tbody element
        const searchInput = document.getElementById("search-input"); // Define search input
        
        // Clear existing rows
        tbody.innerHTML = '';
        
        // Function to display the filtered products
        function displayProducts(filteredData) {
            tbody.innerHTML = ''; // Clear previous rows
            filteredData.forEach(item => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${item.patient_name}</td>
                    <td>${item.medicine_name}</td>
                    <td>${item.producer_name}</td>
                    <td>${item.quantity}</td>
                    <td>${item.sale_date}</td>
                    <td>${item.total_price.toFixed(2)}<span class="euro-symbol"> €</span></td>
                `;
                tbody.appendChild(row);
            });
        }

        // Initially populate the table
        displayProducts(data);

        // Search functionality
        searchInput.addEventListener('input', function() {
            const searchTerm = searchInput.value.toLowerCase();
            // Filter data based on the search term
            const filteredData = data.filter(item =>
                item.patient_name.toLowerCase().includes(searchTerm) ||
                item.medicine_name.toLowerCase().includes(searchTerm) ||
                item.producer_name.toLowerCase().includes(searchTerm)
            );
            displayProducts(filteredData);
        });
    }
});

function sortTable(tableId, columnIndex) {
    const table = document.getElementById(tableId);
    const tbody = table.querySelector('tbody');
    const rows = Array.from(tbody.querySelectorAll('tr')); // Convert rows to an array

    // Determine the sort direction based on the current state
    const isAscending = table.dataset.sortOrder !== 'asc';
    table.dataset.sortOrder = isAscending ? 'asc' : 'desc';

    // Sort rows based on the selected column's text content
    rows.sort((a, b) => {
        const cellA = a.cells[columnIndex].textContent.trim();
        const cellB = b.cells[columnIndex].textContent.trim();

        if (columnIndex === 5) {
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
