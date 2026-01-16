from flask import jsonify, Blueprint, session, request
from db_connection_summentis import get_db_connection
from dotenv import load_dotenv
import json


# Creates blueprints for sign up and login page
display_info_blueprint = Blueprint("display_info", __name__)

load_dotenv()

@display_info_blueprint.route('/api/accounts', methods=['GET'])
def view_user_info():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({"error": "Not logged in"})

    try:
        connection = get_db_connection()
        cursor = connection.cursor()

        cursor.execute("""
        SELECT id, email, created_at, last_login, status, permission_set
        FROM users
        """)

        rows = cursor.fetchall()
        all_info = []
        for row in rows:
            user_info = {
                "id": row[0],
                "email": row[1],
                "created_at": row[2].isoformat() if row[2] else None,
                "last_login": row[3].isoformat() if row[3] else None,
                "status": row[4],
                "permission_set": row[5]
            }
            all_info.append(user_info)
        print(all_info)
    except Exception as e:
        print("Error: ", e)
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        connection.close()

    return jsonify({"all_info": all_info})

@display_info_blueprint.route('/api/accounts/<int:account_id>/status', methods=['POST'])
def account_activation(account_id):
    try:
        data = request.get_json()
        if not data or 'status' not in data:
            return jsonify({'error': 'Status is required'}), 400

        status = data['status']
        if status not in ['active', 'inactive']:
            return jsonify({'error': 'Invalid status'}), 400

        connection = get_db_connection()
        cursor = connection.cursor()

        cursor.execute("""
        UPDATE users
        SET status = %(status)s
        WHERE id = %(user_id)s
        RETURNING id, status
        """, {
            'status': status,
            'user_id': account_id
        })

        updated = cursor.fetchone()

        if not updated:
            return jsonify({'error': 'Account not found'}), 404

        connection.commit()

        return jsonify({
            'message': 'Account stats updated',
            'account': updated
        }), 200

    finally:
        cursor.close()
        connection.close()

@display_info_blueprint.route('/api/accounts/<int:account_id>', methods=['DELETE'])
def delete_user(account_id):
    try:
        connection = get_db_connection()
        cursor = connection.cursor()

        cursor.execute("""
        DELETE FROM users
        WHERE id = %(account_id)s
        RETURNING id
        """, {
            'account_id': account_id
        })

        deleted_id = cursor.fetchone()

        if not deleted_id:
            return jsonify({'error': 'Account not found'}), 404

        connection.commit()

        return jsonify({'deleted_id': deleted_id}), 200

    finally:
        cursor.close()
        connection.close()

@display_info_blueprint.route('/api/accounts/<int:account_id>/permissions', methods=['POST'])
def update_permission(account_id):
    data = request.get_json()

    if not data or 'permissions' not in data:
        return jsonify({'error': 'Permissions object required'}), 400

    permissions = data['permissions']

    # Find enabled permission
    enabled = [k for k, v in permissions.items() if v is True]

    if len(enabled) != 1:
        return jsonify({'error': 'Exactly one permission must be enabled'}), 400

    permission = enabled[0]  # e.g. "T1"

    conn = get_db_connection()
    cur = conn.cursor()

    try:
        cur.execute(
            """
            UPDATE users
            SET permission_set = %(permission)s
            WHERE id = %(user_id)s
            RETURNING id, permission_set
            """, {
                'permission': permission,
                'user_id': account_id
            }
        )

        updated = cur.fetchone()

        if not updated:
            return jsonify({'error': 'Account not found'}), 404

        conn.commit()

        return jsonify({
            'message': 'Permission updated',
            'account_id': updated[0],
            'permission': updated[1]
        }), 200

    finally:
        cur.close()
        conn.close()