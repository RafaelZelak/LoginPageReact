from flask import Flask, request, jsonify
from flask_cors import CORS
import jwt
import datetime

SECRET_KEY = "sua_chave_secreta"

app = Flask(__name__)
CORS(app)

# Dados simulados para login
users = {
    "admin@example.com": "12345",
    "user1@example.com": "senha123"
}

@app.route('/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email')
    password = data.get('password')

    if email in users and users[email] == password:
        # Gerar token JWT com o email do usuário
        token = jwt.encode({
            'email': email,
            'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=1)
        }, SECRET_KEY, algorithm="HS256")

        return jsonify({"message": "Login bem-sucedido!", "token": token})
    else:
        return jsonify({"message": "Email ou senha inválidos!"}), 401

if __name__ == '__main__':
    app.run(debug=True)
