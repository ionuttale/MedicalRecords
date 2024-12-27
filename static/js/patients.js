// Fetch patient data and populate the table
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
                        <button class="modify-btn"><svg version="1.0" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 64 64" enable-background="new 0 0 64 64" xml:space="preserve" fill="#000000"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path fill="#231F20" d="M62.829,16.484L47.513,1.171c-1.562-1.563-4.094-1.563-5.657,0L0,43.031V64h20.973l41.856-41.855 C64.392,20.577,64.392,18.05,62.829,16.484z M18,56H8V46l0.172-0.172l10,10L18,56z"></path> </g></svg></button>
                        <button class="remove-btn"><svg viewBox="0 0 1024 1024" class="icon" version="1.1" xmlns="http://www.w3.org/2000/svg" fill="#000000"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><path d="M667.8 362.1H304V830c0 28.2 23 51 51.3 51h312.4c28.4 0 51.4-22.8 51.4-51V362.2h-51.3z" fill="#CCCCCC"></path><path d="M750.3 295.2c0-8.9-7.6-16.1-17-16.1H289.9c-9.4 0-17 7.2-17 16.1v50.9c0 8.9 7.6 16.1 17 16.1h443.4c9.4 0 17-7.2 17-16.1v-50.9z" fill="#CCCCCC"></path><path d="M733.3 258.3H626.6V196c0-11.5-9.3-20.8-20.8-20.8H419.1c-11.5 0-20.8 9.3-20.8 20.8v62.3H289.9c-20.8 0-37.7 16.5-37.7 36.8V346c0 18.1 13.5 33.1 31.1 36.2V830c0 39.6 32.3 71.8 72.1 71.8h312.4c39.8 0 72.1-32.2 72.1-71.8V382.2c17.7-3.1 31.1-18.1 31.1-36.2v-50.9c0.1-20.2-16.9-36.8-37.7-36.8z m-293.5-41.5h145.3v41.5H439.8v-41.5z m-146.2 83.1H729.5v41.5H293.6v-41.5z m404.8 530.2c0 16.7-13.7 30.3-30.6 30.3H355.4c-16.9 0-30.6-13.6-30.6-30.3V382.9h373.6v447.2z" fill="#211F1E"></path><path d="M511.6 798.9c11.5 0 20.8-9.3 20.8-20.8V466.8c0-11.5-9.3-20.8-20.8-20.8s-20.8 9.3-20.8 20.8v311.4c0 11.4 9.3 20.7 20.8 20.7zM407.8 798.9c11.5 0 20.8-9.3 20.8-20.8V466.8c0-11.5-9.3-20.8-20.8-20.8s-20.8 9.3-20.8 20.8v311.4c0.1 11.4 9.4 20.7 20.8 20.7zM615.4 799.6c11.5 0 20.8-9.3 20.8-20.8V467.4c0-11.5-9.3-20.8-20.8-20.8s-20.8 9.3-20.8 20.8v311.4c0 11.5 9.3 20.8 20.8 20.8z" fill="#211F1E"></path></g></svg></button>
                        
                    </td>
                `;

                // Add event listeners for Modify and Remove buttons
                const removeButton = row.querySelector('.remove-btn');
                const modifyButton = row.querySelector('.modify-btn');

                removeButton.addEventListener('click', () => {
                    row.remove();
                });

                modifyButton.addEventListener('click', () => {
                    const newName = prompt('Enter new name for ' + item.name, item.name);
                    if (newName) {
                        row.cells[0].innerText = newName;
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
                patient.surname.toLowerCase().includes(searchTerm)
            );
            displayPatients(filteredPatients);
        });
    })
    .catch(error => console.error('Error fetching patient data:', error));
