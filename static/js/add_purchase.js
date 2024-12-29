document.getElementById('addPurchaseForm').addEventListener('submit', function(e) {
    e.preventDefault();  // Prevent the default form submission

    const data = {
        patient_name: document.getElementById('patient_name').value,
        patient_surname: document.getElementById('patient_surname').value,
        cnp: document.getElementById('cnp').value,
        medicine_name: document.getElementById('medicine_name').value,
        producer_name: document.getElementById('producer_name').value,
        quantity: document.getElementById('quantity').value
    };

    // Check if any required field is missing or empty
    for (let key in data) {
        if (!data[key]) {
            alert(`Missing field: ${key}`);
            return;
        }
    }

    console.log(data);  

    fetch('/api/add_purchase', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Purchase added successfully!');
            window.location.href = '/purchases';
        } else {
            alert(data.message);  // Display the error message from the server
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
});
