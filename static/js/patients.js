// Fetching the patient data and handling display in the table
fetch('api/get-patients')
    .then(response => response.json())
    .then(data => {
        const tbody = document.getElementById('patient-list');
        const searchInput = document.getElementById('search-input');

        // Function to display patients in the table
        function displayPatients(patients) {
            tbody.innerHTML = ''; // Clear the current table rows
            patients.forEach(item => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${item.name}</td>
                    <td>${item.surname}</td>
                    <td>${new Date().getFullYear() - new Date(item.birthday).getFullYear()}</td>
                    <td>${item.gender}</td>
                    <td>${item.cnp}</td>
                    <td>${item.address}</td>
                    <td>${item.phone_number}</td>
                    <td>${item.email}</td>
                    <td>${item.diagnosis}</td>
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

                // Add event listeners for Modify and Remove buttons
                const removeButton = row.querySelector('.remove-btn');
                const modifyButton = row.querySelector('.modify-btn');
                function isOnPatientPage() {
                    return document.body.classList.contains('patients'); // Check if a class is present in the body
                }
                removeButton.addEventListener('click', () => {
                    if (confirm(`Are you sure you want to delete ${item.name}?`)) {
                        // Send delete request to the server
                        fetch(`api/delete-patient/${item.id}`, { method: 'DELETE' })
                            .then(response => {
                                if (response.ok) {
                                    // Remove the row from the table on success
                                    row.remove();
                                    alert(`${item.name} has been successfully deleted.`);
                                } else {
                                    alert('Failed to delete patient.');
                                }
                            })
                            .catch(error => alert('An error occurred while deleting the patient.'));
                    }
                });

                modifyButton.addEventListener('click', () => {
                    if (isOnPatientPage()) {
                        // Open the modal with current patient data for editing
                        openEditModal(item);
                    } else {
                        console.log('Not on the patient page, modify button is disabled.');
                    }
                });

                tbody.appendChild(row);
            });
        }

        // Initial display of all patients
        displayPatients(data);

        // Filter patients based on search input
        searchInput.addEventListener('input', function() {
            const searchTerm = searchInput.value.toLowerCase();
            const filteredPatients = data.filter(patient =>
                patient.name.toLowerCase().includes(searchTerm) ||
                patient.surname.toLowerCase().includes(searchTerm) ||
                patient.cnp.includes(searchTerm) ||
                patient.phone_number.includes(searchTerm)
            );
            displayPatients(filteredPatients);
        });
    })
    .catch(error => console.error('Error fetching patient data:', error));

// Sorting function for table columns
function sortTable(tableId, columnIndex) {
    const table = document.getElementById(tableId);
    const tbody = table.querySelector('tbody');
    const rows = Array.from(tbody.querySelectorAll('tr'));

    const isAscending = table.dataset.sortOrder !== 'asc';
    table.dataset.sortOrder = isAscending ? 'asc' : 'desc';

    rows.sort((a, b) => {
        const cellA = a.cells[columnIndex].textContent.trim();
        const cellB = b.cells[columnIndex].textContent.trim();

        if (!isNaN(cellA) && !isNaN(cellB)) {
            return isAscending ? cellA - cellB : cellB - cellA;
        }

        return isAscending ? cellA.localeCompare(cellB) : cellB.localeCompare(cellA);
    });

    rows.forEach(row => tbody.appendChild(row));
}

// Modal functionality for editing patient data
function openEditModal(patient) {
    const modal = document.getElementById('editModal');
    const closeModal = document.querySelector('.close');

    // Pre-fill the form fields with the current patient data
    document.getElementById('name').value = patient.name;
    document.getElementById('surname').value = patient.surname;
    document.getElementById('phone_number').value = patient.phone_number;
    document.getElementById('address').value = patient.address;
    document.getElementById('email').value = patient.email;
    document.getElementById('diagnosis').value = patient.diagnosis;

    // Show the modal
    modal.style.display = 'block';

    // Handle form submission
    const updateForm = document.getElementById('updateForm');
    updateForm.onsubmit = function(event) {
        event.preventDefault();

        const updatedData = {
            id: patient.id,
            name: document.getElementById('name').value,
            surname: document.getElementById('surname').value,
            phone_number: document.getElementById('phone_number').value,
            address: document.getElementById('address').value,
            email: document.getElementById('email').value,
            diagnosis: document.getElementById('diagnosis').value
        };

        // Send the updated data to the server
        fetch('/api/update-patient', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updatedData),
        })
        .then(response => response.json())
        .then(data => {
            window.location.reload();
            if (data.message === 'success') {
                alert('Patient data updated successfully!');
                modal.style.display = 'none';

                // Update the row in the table UI
                const row = document.querySelector(`#patient-list tr[data-id="${patient.id}"]`);
                row.cells[0].innerText = updatedData.name;
                row.cells[1].innerText = updatedData.surname;
                row.cells[6].innerText = updatedData.phone_number;
                row.cells[5].innerText = updatedData.address;
                row.cells[7].innerText = updatedData.email;
                row.cells[8].innerText = updatedData.diagnosis;
            } else {
                alert('Failed to update patient data.');
            }
        })
        .catch(error => console.error('Error updating patient data:', error));
    };
}

// Close the modal when the close button is clicked
const editModal = document.getElementById('editModal');
const closeEditModal = document.querySelector('.close');

window.onload = function() {
    const modal = document.getElementById('editModal');
    modal.style.display = 'none'; // Hide the modal by default
};

// Add event listener to close the modal
const closeModalButton = document.querySelector('.close');
closeModalButton.addEventListener('click', () => {
    const modal = document.getElementById('editModal');
    modal.style.display = 'none'; // Hide the modal when the close button is clicked
});

// If you want to also hide the modal when clicking outside of it:
window.onclick = function(event) {
    const modal = document.getElementById('editModal');
    if (event.target === modal) {
        modal.style.display = 'none'; // Close the modal when clicking outside
    }
};

closeEditModal.onclick = function() {
    editModal.style.display = 'none';
}

// Close modal if clicked outside of the modal
window.onclick = function(event) {
    if (event.target === editModal) {
        editModal.style.display = 'none';
    }
}

