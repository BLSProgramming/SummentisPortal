import psycopg

def get_db_connection():
    return psycopg.connect(
        host="localhost",
        dbname="ThreadworkAI",
        user="postgres",
        password="Chiron1!"
    )
