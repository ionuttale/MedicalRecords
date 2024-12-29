// Get the form and its elements
const addPatientForm = document.getElementById('addPatientForm');

// Handle form submission (add patient)
addPatientForm.addEventListener('submit', (event) => {
    event.preventDefault();  // Prevent the default form submission

    // Gather form data
    const patientData = {
        name: document.getElementById('name').value,
        surname: document.getElementById('surname').value,
        cnp: document.getElementById('cnp').value,
        birthday: document.getElementById('birthday').value,
        gender: document.getElementById('gender').value,
        address: document.getElementById('address').value,
        phone_number: document.getElementById('phone_number').value,
        email: document.getElementById('email').value,
        diagnosis: document.getElementById('diagnosis').value,
    };

    // Send the data to the server via fetch
    fetch('/api/add-patient', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(patientData),
    })
    .then(response => response.json())
    .then(data => {
        if (data.message === 'Patient added successfully!') {
            alert('Patient added successfully!');
            window.location.href = '/patients';  // Redirect to the patients list page
        } else {
            alert('There was an error adding the patient: ' + data.error);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('There was an error adding the patient');
    });
});
