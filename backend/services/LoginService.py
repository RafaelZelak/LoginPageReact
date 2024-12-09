import psycopg2
import jwt
import datetime
import bcrypt
from psycopg2 import sql
from psycopg2.extras import RealDictCursor
from config import DB_CONFIG, SECRET_KEY

def get_user_from_db(email):
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        cursor = conn.cursor(cursor_factory=RealDictCursor)

        query = sql.SQL("""
            SELECT id, nome, email, tipo_usuario, status, senha
            FROM users
            WHERE email = %s
        """)
        cursor.execute(query, (email,))
        user = cursor.fetchone()
        conn.close()
        return user
    except Exception as e:
        print("Erro ao conectar ao banco de dados:", e)
        return None

def authenticate_user(email, password):
    user = get_user_from_db(email)
    if user:
        hashed_password = user.get('senha')

        if hashed_password and hashed_password.startswith("$2b$"):
            if bcrypt.checkpw(password.encode('utf-8'), hashed_password.encode('utf-8')):
                del user['senha']
                token = jwt.encode({
                    'user': user,
                    'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=1)
                }, SECRET_KEY, algorithm="HS256")

                return {"success": True, "message": "Login bem-sucedido!", "token": token}
    return {"success": False, "message": "Email ou senha inválidos!"}
