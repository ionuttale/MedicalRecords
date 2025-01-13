from flask import Flask, render_template, request, redirect, url_for, jsonify, Response
from flask_mysqldb import MySQL
import MySQLdb.cursors
import logging

app = Flask(__name__)

app.config['MYSQL_HOST'] = 'localhost'
app.config['MYSQL_USER'] = 'root'
app.config['MYSQL_PASSWORD'] = 'password'
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
        pm.sale_date >= DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL 11 MONTH), '%Y-%m-01')
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

@app.route('/api/delete-patient/<int:id>', methods=['DELETE'])
def delete_patient(id):
    cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
    cursor.execute('DELETE FROM Patients WHERE id = %s', (id,))
    mysql.connection.commit()
    cursor.close()
    return jsonify({'message': 'Patient deleted successfully'})

@app.route('/api/update-patient', methods=['POST'])
def update_patient():
    data = request.get_json()
    patient_id = data['id']
    name = data['name']
    surname = data['surname']
    phone_number = data['phone_number']
    address = data['address']
    email = data['email']

    cursor = mysql.connection.cursor()
    cursor.execute('''UPDATE Patients SET name = %s, surname = %s, phone_number = %s, address = %s, email = %s
                      WHERE id = %s''',
                   (name, surname, phone_number, address, email, patient_id))
    mysql.connection.commit()
    cursor.close()

    return jsonify({'message': 'success'})

@app.route('/api/go_add_patient')
def go_add_patient():
    return render_template('add_patient.html')

@app.route('/api/add-patient', methods=['POST'])
def add_patient():
    # Get data from the request body (JSON)
    patient_data = request.get_json()

    # Extract individual fields from the request
    name = patient_data.get('name')
    surname = patient_data.get('surname')
    cnp = patient_data.get('cnp')
    birthday = patient_data.get('birthday')
    gender = patient_data.get('gender')
    address = patient_data.get('address')
    phone_number = patient_data.get('phone_number')
    email = patient_data.get('email')
    diagnosis = patient_data.get('diagnosis')

    # Check if any required field is missing
    if not all([name, surname, cnp, birthday, gender, address, phone_number, email, diagnosis]):
        return jsonify({'message': 'Missing required fields'}), 400

    # Create the MySQL insert query
    query = """
    INSERT INTO Patients (name, surname, cnp, birthday, gender, address, phone_number, email, diagnosis)
    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
    """
    cursor = mysql.connection.cursor()

    try:
        # Execute the query and commit to the database
        cursor.execute(query, (name, surname, cnp, birthday, gender, address, phone_number, email, diagnosis))
        mysql.connection.commit()

        # Close the cursor and return a success response
        cursor.close()
        return jsonify({'message': 'Patient added successfully!'}), 200
    except Exception as e:
        # Handle any exceptions that occur and return an error response
        print("Error inserting patient:", e)
        cursor.close()
        return jsonify({'message': 'Failed to add patient'}), 500


@app.route('/products')
def products():
    return render_template('products.html')

@app.route('/api/get-products')
def get_medicines():
    cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
    cursor.execute('SELECT * FROM Medicines')
    medicines = cursor.fetchall()
    cursor.close()
    return jsonify(medicines)

@app.route('/api/delete-product/<int:id>', methods=['DELETE'])
def delete_product(id):
    cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
    cursor.execute('DELETE FROM Medicines WHERE id = %s', (id,))
    mysql.connection.commit()
    cursor.close()
    return jsonify({'message': 'Product deleted successfully'})

@app.route('/api/update-product/<int:product_id>', methods=['PUT'])
def update_product(product_id):
    try:
        # Parse the JSON request body
        data = request.get_json()
        name = data.get('name')
        producer = data.get('producer')
        price = data.get('price')
        expiration_date = data.get('expiration_date')
        quantity = data.get('quantity')
        category = data.get('category')
        medical_prescription = data.get('medical_prescription')

        # Validate required fields
        if not all([name, producer, price, expiration_date, quantity, category, medical_prescription]):
            return jsonify({'error': 'All fields are required.'}), 400

        # Connect to the MySQL database and update the product
        cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
        update_query = """
        UPDATE medicines
        SET 
            name = %s,
            producer = %s,
            price = %s,
            expiration_date = %s,
            quantity = %s,
            category = %s,
            medical_prescription = %s
        WHERE id = %s
        """
        cursor.execute(update_query, (name, producer, price, expiration_date, quantity, category, medical_prescription, product_id))
        mysql.connection.commit()

        return jsonify({'message': 'Product updated successfully.'}), 200

    except MySQLdb.Error as e:
        print(f"MySQL Error: {e}")
        return jsonify({'error': 'Failed to update the product.'}), 500
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({'error': 'An error occurred while updating the product.'}), 500

@app.route('/go_add_product')
def go_add_product():
    return render_template('add_product.html')

@app.route('/api/add_product', methods=['POST'])
def add_product():
    try:
        # Get JSON data from the request
        medicine_data = request.get_json()

        # Extract medicine information
        name = medicine_data.get('name')
        producer = medicine_data.get('producer')
        price = medicine_data.get('price')
        expiration_date = medicine_data.get('expiration_date')
        quantity = medicine_data.get('quantity')
        category = medicine_data.get('category')
        medical_prescription = medicine_data.get('medical_prescription')

        # Connect to the MySQL database
        cursor = mysql.connection.cursor()

        # Insert the data into the database
        cursor.execute('''INSERT INTO Medicines (name, producer, price, expiration_date, quantity, category, medical_prescription) 
                          VALUES (%s, %s, %s, %s, %s, %s, %s)''', 
                          (name, producer, price, expiration_date, quantity, category, medical_prescription))

        # Commit the transaction
        mysql.connection.commit()

        return jsonify({'message': 'Medicine added successfully!'}), 200

    except Exception as e:
        # Log the error to the console
        print(f"Error: {str(e)}")
        return jsonify({'error': str(e)}), 500

    finally:
        if cursor:
            cursor.close()

@app.route('/purchases')
def purchases():
    return render_template('purchases.html')

@app.route('/api/get-purchases')
def get_purchases():
    cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
    cursor.execute(''' 
        SELECT 
            pm.id, 
            p.name AS patient_name, 
            p.surname AS patient_surname, 
            p.cnp,  -- Add the cnp column here
            m.name AS medicine_name, 
            m.producer AS producer_name, 
            pm.sale_date, 
            pm.quantity, 
            m.price * pm.quantity AS total_price
        FROM Patients_medicines pm
        JOIN Patients p ON pm.id_patient = p.id
        JOIN Medicines m ON pm.id_medicine = m.id
        ORDER BY pm.sale_date DESC
    ''')
    purchases = cursor.fetchall()
    cursor.close()
    return jsonify(purchases)

@app.route('/api/delete-purchase/<int:id>', methods=['DELETE'])
def delete_purchase(id):
    cursor = mysql.connection.cursor()

    try:
        # Delete the row from the Patients_medicines table using the provided ID
        cursor.execute("DELETE FROM Patients_medicines WHERE id = %s", (id,))
        mysql.connection.commit()  # Commit changes to the database

        # Check if the row was actually deleted
        if cursor.rowcount > 0:
            return jsonify({'message': 'Purchase deleted successfully!'}), 200
        else:
            return jsonify({'message': 'Purchase not found or no rows affected.'}), 404
    except Exception as e:
        # Handle any error during the deletion process
        mysql.connection.rollback()  # Rollback in case of an error
        return jsonify({'message': f'Error occurred: {str(e)}'}), 500
    finally:
        cursor.close()  # Ensure cursor is closed after use

@app.route('/api/update-purchase/<int:id>', methods=['PUT'])
def update_purchase(id):
    cursor = None  # Initialize cursor variable before the try block

    try:
        # Get JSON data from the request
        data = request.get_json()

        # Extract data from the request
        patient_name = data.get('patient_name')
        patient_surname = data.get('patient_surname')
        cnp = data.get('cnp')
        medicine_name = data.get('medicine_name')
        producer_name = data.get('producer_name')
        quantity = data.get('quantity')

        # Initialize the cursor
        cursor = mysql.connection.cursor()

        # Find the patient by name, surname, and CNP
        cursor.execute("SELECT id FROM Patients WHERE cnp = %s", (cnp,))
        patient = cursor.fetchone()

        # Find the medicine by name and producer
        cursor.execute("SELECT id FROM Medicines WHERE name = %s AND producer = %s", (medicine_name, producer_name))
        medicine = cursor.fetchone()

        # If patient or medicine is not found, return error
        if not patient:
            return jsonify({'success': False, 'message': 'Patient not found'}), 400

        if not medicine:
            return jsonify({'success': False, 'message': 'Medicine not found'}), 400

        # Update the Patients_medicines table with new data
        cursor.execute("""
            UPDATE Patients_medicines
            SET id_patient = %s, id_medicine = %s, quantity = %s
            WHERE id = %s
        """, (patient[0], medicine[0], quantity, id))

        # Commit the transaction
        mysql.connection.commit()

        return jsonify({'success': True, 'message': 'Purchase updated successfully!'})

    except MySQLdb.Error as e:
        print("Error updating data:", e)
        mysql.connection.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

    except Exception as e:
        print("Error:", e)
        return jsonify({'success': False, 'error': str(e)}), 500

    finally:
        if cursor:
            cursor.close()


@app.route('/go_add_purchase')
def go_add_purchase():
    return render_template('add_purchase.html')

@app.route('/api/add_purchase', methods=['POST'])
def add_purchase():
    try:
        # Get JSON data from the request
        data = request.get_json()

        patient_name = data.get('patient_name')
        patient_surname = data.get('patient_surname')
        cnp = data.get('cnp')
        medicine_name = data.get('medicine_name')
        producer_name = data.get('producer_name')
        quantity = data.get('quantity')

        cursor = mysql.connection.cursor()

        # Find the patient by name, surname, and CNP
        cursor.execute("SELECT id FROM Patients WHERE cnp = %s", (cnp,))
        patient = cursor.fetchone()

        # Find the medicine by name and producer
        cursor.execute("SELECT id FROM Medicines WHERE name = %s AND producer = %s", (medicine_name, producer_name))
        medicine = cursor.fetchone()

        # If patient or medicine is not found, return error
        if not patient:
            return jsonify({'success': False, 'message': 'Patient not found'}), 400

        if not medicine:
            return jsonify({'success': False, 'message': 'Medicine not found'}), 400

        # Insert into the Patients_medicines table
        cursor.execute("""
            INSERT INTO Patients_medicines (id_patient, id_medicine, quantity)
            VALUES (%s, %s, %s)
        """, (patient[0], medicine[0], quantity))
        
        # Commit the transaction
        mysql.connection.commit()

        return jsonify({'success': True, 'message': 'Purchase added successfully!'})

    except MySQLdb.Error as e:
        print("Error inserting data:", e)
        mysql.connection.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

    finally:
        cursor.close()

@app.route('/contact')
def contact():
    return render_template('contact.html')

@app.route('/about')
def about():
    return render_template('about.html')

if __name__ == '__main__':
    app.run(debug=True)
