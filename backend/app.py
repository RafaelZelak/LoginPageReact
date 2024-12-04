from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Permite comunicação entre diferentes domínios (React <-> Flask)

@app.route('/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email')
    password = data.get('password')

    # Simples validação (exemplo, verificar se o usuário e senha estão corretos)
    if email == 'admin@example.com' and password == '1234':
        return jsonify({"message": "Login bem-sucedido!", "status": "success"})
    else:
        return jsonify({"message": "Email ou senha inválidos!", "status": "error"}), 401

if __name__ == '__main__':
    app.run(debug=True)
