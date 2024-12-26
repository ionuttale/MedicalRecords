from flask import Flask, render_template, request, redirect, url_for, jsonify
from flask_mysqldb import MySQL
import MySQLdb.cursors

app = Flask(__name__)

app.config['MYSQL_HOST'] = 'localhost'
app.config['MYSQL_USER'] = 'root'
app.config['MYSQL_PASSWORD'] = 'Cavaler19'
app.config['MYSQL_DB'] = 'MedicalRecords'

mysql = MySQL(app)


@app.route('/')
def login():
    return render_template('login.html')

@app.route('/login', methods=['POST'])
def login_post():
    username = request.form.get('username')
    password = request.form.get('password')
    # Example authentication logic
    if username == "admin" and password == "password":  # Example
        return redirect(url_for('home'))
    else:
        return redirect(url_for('login'))

@app.route('/home')
def home():
    return render_template('home.html')

@app.route('/api/dashboard_data')
def dashboard_data():
    cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
        
    # Get total patients
    cursor.execute('SELECT COUNT(*) AS total_patients FROM Patients')
    total_patients = cursor.fetchone()['total_patients']
        
    # Get total medicines
    cursor.execute('SELECT COUNT(*) AS total_medicines FROM Medicines')
    total_medicines = cursor.fetchone()['total_medicines']
    
    # Get total sales
    cursor.execute('SELECT SUM(pm.quantity * m.price) as total_sales FROM Patients_medicines pm, Medicines m WHERE pm.id_medicine = m.id')
    total_sales = cursor.fetchone()['total_sales']
    
    # Get out-of-stock medicines
    cursor.execute('SELECT COUNT(*) AS out_of_stock FROM Medicines WHERE quantity = 0')
    out_of_stock = cursor.fetchone()['out_of_stock']
    
    print(total_patients, total_medicines, total_sales, out_of_stock)  

    return jsonify({
        "total_patients": total_patients,
        "total_medicines": total_medicines,
        "total_sales": total_sales,
        "out_of_stock": out_of_stock or 0
    })

@app.route('/api/expiring_medicines')
def expiring_medicines():
    cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
    cursor.execute('''
        SELECT name, expiration_date, quantity
        FROM Medicines
        WHERE expiration_date <= DATE_ADD(CURDATE(), INTERVAL 3 MONTH)
        ORDER BY expiration_date ASC
    ''')
    medicines = cursor.fetchall()
    return jsonify(medicines)

@app.route('/api/recent_sales')
def recent_sales():
    cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
    cursor.execute('''
        SELECT p.name AS patient_name, m.name AS medicine_name, pm.sale_date, pm.quantity
        FROM Patients_medicines pm
        JOIN Patients p ON pm.id_patient = p.id
        JOIN Medicines m ON pm.id_medicine = m.id
        ORDER BY pm.sale_date DESC
        LIMIT 10
    ''')
    sales = cursor.fetchall()
    return jsonify(sales)


if __name__ == '__main__':
    app.run(debug=True)
