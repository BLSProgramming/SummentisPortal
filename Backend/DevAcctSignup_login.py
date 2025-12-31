from flask import Blueprint, request, jsonify, session
import bcrypt
from db_connection_summentis import get_db_connection

# Creates blueprints for sign up and login
dev_acct_signup_routes = Blueprint("dev_acct_signup", __name__)

# Hashes password
def password_hash(password):
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

# Checks login password hash with stored password hash
def check_password(password, hashed_password):
    return bcrypt.checkpw(password.encode('utf-8'), hashed_password.encode('utf-8'))

@dev_acct_signup_routes.route('/api/create-account', methods=['POST'])
def dev_signup():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    # Checks if fields are empty
    if not email or not password:
        return jsonify({"error": "Email and password required"}), 400

    # Hashed password
    hashed_password = password_hash(password)

    connection = get_db_connection()
    cursor = connection.cursor()

    # Check if email exists
    cursor.execute("""
    SELECT 1
    FROM users
    WHERE email = %(email)s
    """, {
        'email': email
    })
    existing_user = cursor.fetchone()

    if existing_user:
        cursor.close()
        connection.close()
        return jsonify({"error": "Email already registered"}), 400

    # Hash password and insert if email is free
    cursor.execute("""
    INSERT INTO users (email, password)
    VALUES (%(email)s, %(password)s)
    RETURNING id
    """, {
        'email': email,
        'password': hashed_password
    })

    user_id = cursor.fetchone()[0]

    connection.commit()
    cursor.close()
    connection.close()

    return jsonify({"message": "User created successfully"}), 200


@dev_acct_signup_routes.route('/api/portal-login', methods=["POST"])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({'error': 'Email and password required'}), 400

    try:
        connection = get_db_connection()
        cursor = connection.cursor()

        # Get stored id and password from DB
        cursor.execute("""
            SELECT id, password
            FROM users
            WHERE email = %(email)s
        """, {
            'email': email
        })
        row = cursor.fetchone()

        # Checks if user exists
        if not row:
            cursor.close()
            connection.close()
            return jsonify({"error": "invalid email or password"}), 401

        user_id = row[0]
        stored_hash = row[1]

        # Checks password hash
        if not check_password(password, stored_hash):
            cursor.close()
            connection.close()
            return jsonify({"error": "invalid email or password"}), 401

        # Authenticate if passwords match
        session['user_id'] = user_id
        cursor.close()
        connection.close()

        return jsonify({"success": "access granted"}), 200

    except Exception as e:
        print("Error ", e)
        return jsonify({"error": str(e)})




