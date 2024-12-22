from flask import Flask, render_template, request
import mysql.connector

app = Flask(__name__)

# Configure MySQL database connection
db_config = {
    'host': 'localhost',
    'user': 'root',
    'password': 'Cavaler19',
    'database': 'MedicalRecords'
}

def get_db_connection():
    """Create a new database connection."""
    connection = mysql.connector.connect(**db_config)
    return connection

@app.route('/')
def index():
    """Fetch all patients and their prescribed medicines."""
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)
    
    # Get all patients and their medicines
    cursor.execute("""
        SELECT p.id, p.name, p.surname, p.cnp, p.birthday, p.gender, p.phone_number, p.email, m.name AS medicine_name, pm.quantity
        FROM Patients p
        LEFT JOIN Patients_medicines pm ON p.id = pm.id_patient
        LEFT JOIN Medicines m ON pm.id_medicine = m.id
    """)
    patients = cursor.fetchall()
    connection.close()
    return render_template('index.html', patients=patients)

@app.route('/add', methods=['POST'])
def add_patient():
    """Add a new patient to the database."""
    name = request.form.get('name')
    surname = request.form.get('surname')
    cnp = request.form.get('cnp')
    birthday = request.form.get('birthday')
    gender = request.form.get('gender')
    phone_number = request.form.get('phone_number')
    email = request.form.get('email')
    
    if name and surname and cnp:
        connection = get_db_connection()
        cursor = connection.cursor()
        cursor.execute("""
            INSERT INTO Patients (name, surname, cnp, birthday, gender, phone_number, email)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
        """, (name, surname, cnp, birthday, gender, phone_number, email))
        connection.commit()
        connection.close()
    return "Patient added successfully!"

if __name__ == '__main__':
    app.run(debug=True)
