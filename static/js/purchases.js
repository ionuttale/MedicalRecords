fetch('api/get-purchases')
    .then(response => response.json())
    .then(data => {
        const tbody = document.getElementById('recent-sales');
        const searchInput = document.getElementById('search-input');
        const editModal = document.getElementById('editModal');
        const modalClose = editModal.querySelector('.close');
        const updateForm = document.getElementById('updateForm');
        let currentEditingPurchase = null; // Track the purchase being edited

        // Ensure the modal is hidden when the page loads
        window.onload = function () {
            editModal.style.display = 'none';
        };

        // Function to display purchases in the table
        function displayPurchases(purchases) {
            tbody.innerHTML = ''; // Clear the current table rows

            purchases.forEach(item => {
                const row = document.createElement('tr');
                console.log(item);

                // Convert purchase_date to "DD MMM YYYY"
                row.innerHTML = `
                    <td>${item.patient_name}</td>
                    <td>${item.medicine_name}</td>
                    <td>${item.producer_name}</td>
                    <td>${item.quantity}</td>
                    <td>${item.sale_date}</td>
                    <td>${item.total_price !== undefined && item.total_price !== null ? item.total_price.toFixed(2) : 'N/A'}</td> <!-- Added check for total_price -->
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

                // Add event listeners for Modify button
                const modifyButton = row.querySelector('.modify-btn');
                modifyButton.addEventListener('click', () => {
                    currentEditingPurchase = item; // Set the current purchase being edited
                    openEditModal(item); // Open the modal with current item data
                });

                // Add event listeners for Remove button
                const removeButton = row.querySelector('.remove-btn');
                removeButton.addEventListener('click', () => {
                    if (confirm(`Are you sure you want to delete this purchase?`)) {
                        fetch(`api/delete-purchase/${item.id}`, { method: 'DELETE' })
                            .then(response => {
                                if (response.ok) {
                                    row.remove();
                                    alert(`Purchase has been successfully deleted.`);
                                } else {
                                    throw new Error('Failed to delete purchase.');
                                }
                            })
                            .catch(error => {
                                console.error('Error deleting purchase:', error);
                                alert('An error occurred while deleting the purchase.');
                            });
                    }
                });

                tbody.appendChild(row);
            });
        }

        // Function to open the Edit Modal and populate fields
        function openEditModal(purchase) {
            console.log('Opening edit modal for:', purchase); // Debugging log

            editModal.style.display = 'block';  // Make the modal visible

            // Access the correct form fields using their IDs
            const form = updateForm;

            // Ensure each input is being correctly populated
            form.patientName.value = purchase.patient_name || '';  // Default to empty if not available
            form.medicineName.value = purchase.medicine_name || '';
            form.producer.value = purchase.producer_name || '';
            form.quantity.value = purchase.quantity || '';  // Default to empty if not available

            // Ensure the date is correctly formatted
            if (purchase.purchase_date) {
                form.purchaseDate.value = new Date(purchase.purchase_date).toISOString().split('T')[0];
            } else {
                form.purchaseDate.value = '';  // Default to empty if no date available
            }

            // Set the CNP field value
            form.cnp.value = purchase.cnp || '';  // Set CNP value

            console.log('Form values:', {
                patientName: form.patientName.value,
                medicineName: form.medicineName.value,
                producer: form.producer.value,
                quantity: form.quantity.value,
                purchaseDate: form.purchaseDate.value,
                cnp: form.cnp.value // Debugging log for `cnp`
            });
        }

        // Function to close the Edit Modal
        function closeEditModal() {
            editModal.style.display = 'none';
            currentEditingPurchase = null;
        }

        // Handle form submission for updating a purchase
        updateForm.addEventListener('submit', (event) => {
            event.preventDefault(); // Prevent default form submission

            if (currentEditingPurchase) {
                const updatedPurchase = {
                    id: currentEditingPurchase.id,
                    patient_name: updateForm.patientName.value,
                    medicine_name: updateForm.medicineName.value,
                    producer_name: updateForm.producer.value,
                    quantity: parseInt(updateForm.quantity.value, 10),
                    purchase_date: updateForm.purchaseDate.value,
                    cnp: updateForm.cnp.value // Include CNP in the request payload
                };

                // Send the updated data to the server
                fetch(`api/update-purchase/${currentEditingPurchase.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(updatedPurchase)
                })
                    .then(response => {
                        if (response.ok) {
                            window.location.reload();
                            // Update the UI and close the modal
                            displayPurchases(data.map(purchase =>
                                purchase.id === updatedPurchase.id ? updatedPurchase : purchase
                            ));
                            closeEditModal();
                            alert(`${updatedPurchase.medicine_name} has been successfully updated.`);
                        } else {
                            throw new Error('Failed to update purchase.');
                        }
                    })
                    .catch(error => {
                        console.error('Error updating purchase:', error);
                        alert('An error occurred while updating the purchase.');
                    });
            }
        });

        // Initial display of all purchases
        displayPurchases(data);

        // Filter purchases based on search input
        searchInput.addEventListener('input', function () {
            const searchTerm = searchInput.value.toLowerCase();
            const filteredPurchases = data.filter(purchase =>
                purchase.patient_name.toLowerCase().includes(searchTerm) ||
                purchase.medicine_name.toLowerCase().includes(searchTerm) ||
                purchase.producer_name.toLowerCase().includes(searchTerm)
            );
            displayPurchases(filteredPurchases);
        });

        // Modal functionality for closing
        modalClose.onclick = closeEditModal;

        // Close modal if clicked outside of it
        window.onclick = function (event) {
            if (event.target === editModal) {
                closeEditModal();
            }
        };

    })
    .catch(error => console.error('Error fetching purchase data:', error));
