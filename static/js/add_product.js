// Get the form element
const addMedicineForm = document.getElementById('addMedicineForm');

// Handle form submission
addMedicineForm.addEventListener('submit', (event) => {
    event.preventDefault();  // Prevent the default form submission

    // Gather form data
    const medicineData = {
        name: document.getElementById('name').value,
        producer: document.getElementById('producer').value,
        price: parseFloat(document.getElementById('price').value),
        expiration_date: document.getElementById('expiration_date').value,
        quantity: parseInt(document.getElementById('quantity').value),
        category: document.getElementById('category').value,
        medical_prescription: document.getElementById('medical_prescription').value,
    };

    // Send the data to the server using fetch
    fetch('/api/add_product', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(medicineData),
    })
    .then(response => response.json())
    .then(data => {
        if (data.message === 'Medicine added successfully!') {
            alert('Medicine added successfully!');
            window.location.href = '/products';  // Redirect to medicines list page
        } else {
            alert('Error adding medicine: ' + data.error);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('There was an error adding the medicine');
    });
});
