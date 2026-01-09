from flask import jsonify, Blueprint, session
from db_connection_summentis import get_db_connection
from dotenv import load_dotenv

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
        WHERE id = %(user_id)s
        """, {

            'user_id': user_id
        })

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