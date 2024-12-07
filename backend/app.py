from flask import Flask, request, jsonify
from flask_cors import CORS
import jwt
import datetime
import psycopg2
from psycopg2 import sql
from psycopg2.extras import RealDictCursor

SECRET_KEY = "calvo"
app = Flask(__name__)
CORS(app)

# Configuração do banco de dados
DB_CONFIG = {
    'dbname': 'gestao_negocio',
    'user': 'postgres',
    'password': 'r1r2r3r4r5',
    'host': 'localhost',
    'port': 5432
}

def get_user_from_db(email, password):
    """
    Consulta o banco de dados para buscar um usuário pelo email e senha.
    """
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        cursor = conn.cursor(cursor_factory=RealDictCursor)

        query = sql.SQL("""
            SELECT id, nome, email, tipo_usuario, status
            FROM users
            WHERE email = %s AND senha = %s
        """)
        cursor.execute(query, (email, password))

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

    user = get_user_from_db(email, password)

    if user:
        token = jwt.encode({
            'user': user,
            'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=1)
        }, SECRET_KEY, algorithm="HS256")

        return jsonify({"message": "Login bem-sucedido!", "token": token})
    else:
        return jsonify({"message": "Email ou senha inválidos!"}), 401

if __name__ == '__main__':
    app.run(debug=True)
