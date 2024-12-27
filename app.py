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
    
    # print(total_patients, total_medicines, total_sales, out_of_stock)  

    cursor.close()

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
    cursor.close()
    return jsonify(medicines)


@app.route('/api/get_monthly_income')
def get_monthly_income():
    cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)

    # SQL query to calculate monthly income (sum of price * quantity for each medicine sold)
    cursor.execute("""
    SELECT 
        DATE_FORMAT(pm.sale_date, '%Y-%m') AS month,  -- Format the date as 'Year-Month'
        SUM(m.price * pm.quantity) AS total_income
    FROM 
        Patients_medicines pm
    JOIN 
        Medicines m ON pm.id_medicine = m.id
    JOIN 
        Patients p ON pm.id_patient = p.id
    WHERE 
        (pm.sale_date >= DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL 11 MONTH), '%Y-%m-01') AND 
         pm.sale_date < DATE_FORMAT(CURDATE(), '%Y-%m-01'))
    GROUP BY 
        month
    ORDER BY 
        month DESC;
    """)

    result = cursor.fetchall()
    
    # print(result)

    # Process the result into two lists: months and income
    months = [row['month'] for row in result]  # Access the 'month' key
    income = [row['total_income'] for row in result]  # Access the 'total_income' key

    cursor.close()

    # Return the data as JSON
    return jsonify({
        'months': months,
        'income': income
    })


@app.route('/api/recent_sales')
def recent_sales():
    cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
    cursor.execute('''
        SELECT p.name AS patient_name, m.name AS medicine_name, pm.sale_date, pm.quantity, m.price * pm.quantity AS total_price
        FROM Patients_medicines pm
        JOIN Patients p ON pm.id_patient = p.id
        JOIN Medicines m ON pm.id_medicine = m.id
        ORDER BY pm.sale_date DESC
        LIMIT 10
    ''')
    sales = cursor.fetchall()
    cursor.close()
    return jsonify(sales)

@app.route('/patients')
def patients():
    return render_template('patients.html')

@app.route('/api/get-patients')
def get_patients():
    cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
    cursor.execute('SELECT * FROM Patients')
    patients = cursor.fetchall()
    cursor.close()
    return jsonify(patients)

@app.route('/products')
def products():
    return render_template('products.html')

@app.route('/purchase')
def purchase():
    return render_template('purchase.html')

@app.route('/contact')
def contact():
    return render_template('contact.html')

@app.route('/about')
def about():
    return render_template('about.html')

if __name__ == '__main__':
    app.run(debug=True)
