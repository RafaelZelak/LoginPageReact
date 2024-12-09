from flask import Blueprint, jsonify

chat_route = Blueprint('chat', __name__)  # Certifique-se de que o nome é 'chat_route'

@chat_route.route('', methods=['GET'])
def chat():
    print("Rota /chat foi acessada")
    return jsonify({"message": "Bem-vindo à rota de chat!"}), 200
