fetch('api/get-products')
    .then(response => response.json())
    .then(data => {
        const tbody = document.getElementById('product-list');
        const searchInput = document.getElementById('search-input');
        const editModal = document.getElementById('editModal');
        const modalClose = editModal.querySelector('.close');
        const updateForm = document.getElementById('updateForm');
        let currentEditingProduct = null; // Track the product being edited

        // Ensure the modal is hidden when the page loads
        window.onload = function () {
            editModal.style.display = 'none';
        };

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
                    <td>${formattedDate}</td>
                    <td>${item.quantity}</td>
                    <td>${item.category}</td>
                    <td>${item.medical_prescription}</td>
                    <td>
                        <button class="remove-btn">
                            <svg viewBox="0 0 1024 1024" class="icon" version="1.1" xmlns="http://www.w3.org/2000/svg" fill="#000000"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><path d="M667.8 362.1H304V830c0 28.2 23 51 51.3 51h312.4c28.4 0 51.4-22.8 51.4-51V362.2h-51.3z" fill="#CCCCCC"></path><path d="M750.3 295.2c0-8.9-7.6-16.1-17-16.1H289.9c-9.4 0-17 7.2-17 16.1v50.9c0 8.9 7.6 16.1 17 16.1h443.4c9.4 0 17-7.2 17-16.1v-50.9z" fill="#CCCCCC"></path><path d="M733.3 258.3H626.6V196c0-11.5-9.3-20.8-20.8-20.8H419.1c-11.5 0-20.8 9.3-20.8 20.8v62.3H289.9c-20.8 0-37.7 16.5-37.7 36.8V346c0 18.1 13.5 33.1 31.1 36.2V830c0 39.6 32.3 71.8 72.1 71.8h312.4c39.8 0 72.1-32.2 72.1-71.8V382.2c17.7-3.1 31.1-18.1 31.1-36.2v-50.9c0.1-20.2-16.9-36.8-37.7-36.8z m-293.5-41.5h145.3v41.5H439.8v-41.5z m-146.2 83.1H729.5v41.5H293.6v-41.5z m404.8 530.2c0 16.7-13.7 30.3-30.6 30.3H355.4c-16.9 0-30.6-13.6-30.6-30.3V382.9h373.6v447.2z" fill="#211F1E"></path><path d="M511.6 798.9c11.5 0 20.8-9.3 20.8-20.8V466.8c0-11.5-9.3-20.8-20.8-20.8s-20.8 9.3-20.8 20.8v311.4c0 11.4 9.3 20.7 20.8 20.7zM407.8 798.9c11.5 0 20.8-9.3 20.8-20.8V466.8c0-11.5-9.3-20.8-20.8-20.8s-20.8 9.3-20.8 20.8v311.4c0.1 11.4 9.4 20.7 20.8 20.7zM615.4 799.6c11.5 0 20.8-9.3 20.8-20.8V467.4c0-11.5-9.3-20.8-20.8-20.8s-20.8 9.3-20.8 20.8v311.4c0 11.5 9.3 20.8 20.8 20.8z" fill="#211F1E"></path></g></svg>
                        </button>
                        <button class="modify-btn">
                            <svg version="1.0" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" 
	 width="800px" height="800px" viewBox="0 0 64 64" enable-background="new 0 0 64 64" xml:space="preserve">
<path fill="#231F20" d="M62.829,16.484L47.513,1.171c-1.562-1.563-4.094-1.563-5.657,0L0,43.031V64h20.973l41.856-41.855
	C64.392,20.577,64.392,18.05,62.829,16.484z M18,56H8V46l0.172-0.172l10,10L18,56z"/>
</svg>
                        </button>
                    </td>
                `;

                // Add event listeners for Modify button (previously Edit button)
                const modifyButton = row.querySelector('.modify-btn');
                modifyButton.addEventListener('click', () => {
                    currentEditingProduct = item; // Set the current product being edited
                    openEditModal(item);
                });

                // Add event listeners for Remove button
                const removeButton = row.querySelector('.remove-btn');
                removeButton.addEventListener('click', () => {
                    if (confirm(`Are you sure you want to delete ${item.name}?`)) {
                        fetch(`api/delete-product/${item.id}`, { method: 'DELETE' })
                            .then(response => {
                                if (response.ok) {
                                    row.remove();
                                    alert(`${item.name} has been successfully deleted.`);
                                } else {
                                    throw new Error('Failed to delete product.');
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

        // Function to open the Edit Modal and populate fields
        function openEditModal(product) {
            editModal.style.display = 'block';
            updateForm.name.value = product.name;
            updateForm.producer.value = product.producer;
            updateForm.price.value = product.price;
            updateForm.expiration_date.value = new Date(product.expiration_date).toISOString().split('T')[0];
            updateForm.quantity.value = product.quantity;
            updateForm.category.value = product.category;
            updateForm.medical_prescription.value = product.medical_prescription;
        }

        // Function to close the Edit Modal
        function closeEditModal() {
            editModal.style.display = 'none'; // Hide modal
            currentEditingProduct = null;
        }

        // Handle form submission for updating a product
        updateForm.addEventListener('submit', (event) => {
            event.preventDefault(); // Prevent default form submission

            if (currentEditingProduct) {
                const updatedProduct = {
                    id: currentEditingProduct.id,
                    name: updateForm.name.value,
                    producer: updateForm.producer.value,
                    price: parseFloat(updateForm.price.value),
                    expiration_date: updateForm.expiration_date.value,
                    quantity: parseInt(updateForm.quantity.value, 10),
                    category: updateForm.category.value,
                    medical_prescription: updateForm.medical_prescription.value
                };

                // Send the updated data to the server
                fetch(`api/update-product/${currentEditingProduct.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(updatedProduct)
                })
                    .then(response => {
                        if (response.ok) {
                            // Update the UI and close the modal
                            displayProducts(data.map(product =>
                                product.id === updatedProduct.id ? updatedProduct : product
                            ));
                            closeEditModal();
                            alert(`${updatedProduct.name} has been successfully updated.`);
                        } else {
                            throw new Error('Failed to update product.');
                        }
                    })
                    .catch(error => {
                        console.error('Error updating product:', error);
                        alert('An error occurred while updating the product.');
                    });
            }
        });

        // Initial display of all products
        displayProducts(data);

        // Filter products based on search input
        searchInput.addEventListener('input', function () {
            const searchTerm = searchInput.value.toLowerCase();
            const filteredProducts = data.filter(product =>
                product.name.toLowerCase().includes(searchTerm) ||
                product.producer.toLowerCase().includes(searchTerm)
            );
            displayProducts(filteredProducts);
        });

        // Modal functionality for closing
        modalClose.onclick = function () {
            closeEditModal(); // Close modal when the close button is clicked
        };

        // Close modal if clicked outside of it
        window.onclick = function (event) {
            if (event.target === editModal) {
                closeEditModal();
            }
        };

    })
    .catch(error => console.error('Error fetching product data:', error));
