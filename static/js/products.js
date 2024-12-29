fetch('api/get-products')
    .then(response => response.json())
    .then(data => {
        const tbody = document.getElementById('product-list');
        const searchInput = document.getElementById('search-input');

        // Function to display products in the table
        function displayProducts(products) {
            tbody.innerHTML = ''; // Clear the current table rows
        
            products.forEach(item => {
                const row = document.createElement('tr');
        
                // Convert expiration_date to "DD MMM YYYY"
                const expirationDate = new Date(item.expiration_date);
                const formattedDate = expirationDate.toLocaleDateString('en-GB', {
                    year: 'numeric', 
                    month: 'short', 
                    day: '2-digit'
                });
        
                row.innerHTML = `
                    <td>${item.name}</td>
                    <td>${item.producer}</td>
                    <td>${item.price}</td>
                    <td>${formattedDate}</td> <!-- Formatted expiration date -->
                    <td>${item.quantity}</td>
                    <td>${item.category}</td>
                    <td>${item.medical_prescription}</td>
                    <td>
                        <button class="remove-btn">
                            <svg viewBox="0 0 1024 1024" class="icon" version="1.1" xmlns="http://www.w3.org/2000/svg" fill="#000000">
                                <g id="SVGRepo_iconCarrier">
                                    <path d="M667.8 362.1H304V830c0 28.2 23 51 51.3 51h312.4c28.4 0 51.4-22.8 51.4-51V362.2h-51.3z" fill="#CCCCCC"></path>
                                    <path d="M750.3 295.2c0-8.9-7.6-16.1-17-16.1H289.9c-9.4 0-17 7.2-17 16.1v50.9c0 8.9 7.6 16.1 17 16.1h443.4c9.4 0 17-7.2 17-16.1v-50.9z" fill="#CCCCCC"></path>
                                    <path d="M733.3 258.3H626.6V196c0-11.5-9.3-20.8-20.8-20.8H419.1c-11.5 0-20.8 9.3-20.8 20.8v62.3H289.9c-20.8 0-37.7 16.5-37.7 36.8V346c0 18.1 13.5 33.1 31.1 36.2V830c0 39.6 32.3 71.8 72.1 71.8h312.4c39.8 0 72.1-32.2 72.1-71.8V382.2c17.7-3.1 31.1-18.1 31.1-36.2v-50.9c0.1-20.2-16.9-36.8-37.7-36.8z m-293.5-41.5h145.3v41.5H439.8v-41.5z m-146.2 83.1H729.5v41.5H293.6v-41.5z m404.8 530.2c0 16.7-13.7 30.3-30.6 30.3H355.4c-16.9 0-30.6-13.6-30.6-30.3V382.9h373.6v447.2z" fill="#211F1E"></path>
                                </g>
                            </svg>
                        </button>
                    </td>
                `;
        
                // Add event listeners for Remove button
                const removeButton = row.querySelector('.remove-btn');
                removeButton.addEventListener('click', () => {
                    if (confirm(`Are you sure you want to delete ${item.name}?`)) {
                        // Send delete request to the server
                        fetch(`api/delete-product/${item.id}`, {
                            method: 'DELETE',
                        })
                        .then(response => {
                            if (response.ok) {
                                // Remove the row from the table on success
                                row.remove();
                                alert(`${item.name} has been successfully deleted.`);
                            } else {
                                throw new Error('Failed to delete product from database.');
                            }
                        })
                        .catch(error => {
                            console.error('Error deleting product:', error);
                            alert('An error occurred while deleting the product.');
                        });
                    }
                });
        
                tbody.appendChild(row);
            });
        }

        // Initial display of all products
        displayProducts(data);

        // Filter products based on search input
        searchInput.addEventListener('input', function() {
            const searchTerm = searchInput.value.toLowerCase();
            const filteredProducts = data.filter(product =>
                product.name.toLowerCase().includes(searchTerm) || 
                product.producer.toLowerCase().includes(searchTerm)
            );
            displayProducts(filteredProducts);
        });
    })
    .catch(error => console.error('Error fetching product data:', error));

// Sorting function for table columns
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

        if (columnIndex === 3) {
            // Extract the year from the date string (assumed format is "01 Aug 2025")
            const yearA = new Date(cellA).getFullYear();
            const yearB = new Date(cellB).getFullYear();
            
            // Sort based on the extracted year
            return isAscending ? yearA - yearB : yearB - yearA;
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
