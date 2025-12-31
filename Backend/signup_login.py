from flask import Blueprint, request, jsonify, session
import bcrypt
from db_connection_threadwork import get_db_connection

# Creates blueprints for sign up and login
signup_routes = Blueprint("signup_login", __name__)

# Checks login password hash with stored password hash
def check_password(password, hashed_password):
    return bcrypt.checkpw(password.encode('utf-8'), hashed_password.encode('utf-8'))


@signup_routes.route('/api/login', methods=["POST"])
def login():
    try:
        data = request.get_json(force=True)
        email = data.get("email")
        password = data.get("password")

        if not email or not password:
            return jsonify({"error": "Email and password required"}), 400

        connection = get_db_connection()
        cursor = connection.cursor()

        cursor.execute("""
            SELECT id, password
            FROM users
            WHERE email = %(email)s
        """, {"email": email})

        row = cursor.fetchone()
        if not row:
            return jsonify({"error": "Invalid email or password"}), 401

        user_id, stored_hash = row

        if isinstance(stored_hash, str):
            stored_hash = stored_hash.encode("utf-8")

        if not bcrypt.checkpw(password.encode("utf-8"), stored_hash):
            return jsonify({"error": "Invalid email or password"}), 401

        session["user_id"] = user_id
        return jsonify({"success": True}), 200

    except Exception as e:
        print("LOGIN ERROR:", e)
        return jsonify({"error": "Server error"}), 500
