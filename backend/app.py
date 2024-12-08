from flask import Flask, request, jsonify
from flask_cors import CORS
import jwt
import datetime
import psycopg2
from psycopg2 import sql
from psycopg2.extras import RealDictCursor
import bcrypt

SECRET_KEY = "calvo"
app = Flask(__name__)
CORS(app)

DB_CONFIG = {
    'dbname': 'gestao_negocio',
    'user': 'postgres',
    'password': 'r1r2r3r4r5',
    'host': 'localhost',
    'port': 5432
}

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

        # Obter o resultado
        user = cursor.fetchone()
        conn.close()
        return user
    except Exception as e:
        print("Erro ao conectar ao banco de dados:", e)
        return None

@app.route('/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email')
    password = data.get('password')

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

                return jsonify({"message": "Login bem-sucedido!", "token": token})
        return jsonify({"message": "Email ou senha inválidos!"}), 401
    else:
        return jsonify({"message": "Email ou senha inválidos!"}), 401

if __name__ == '__main__':
    app.run(debug=True)
