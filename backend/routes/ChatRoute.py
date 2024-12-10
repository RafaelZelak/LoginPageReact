from flask import Blueprint, request, jsonify
from flask_socketio import emit
from extensions import socketio
from services.ChatService import ChatService
from extensions import db
import logging
log = logging.getLogger('werkzeug')
log.setLevel(logging.WARNING)

chat_route = Blueprint('chat_route', __name__)

@chat_route.route('/load_messages', methods=['GET'])
def load_messages():
    try:
        messages = ChatService.get_messages()
        return jsonify(messages), 200
    except Exception as e:
        logging.error(f"Erro ao carregar mensagens: {str(e)}")
        return jsonify({"error": str(e)}), 500

@socketio.on('send_message')
def handle_send_message(data):
    user_id = data.get('user_id')
    message = data.get('message', '')

    if not user_id or not message.strip():
        return emit('error', {'message': 'Dados inválidos'}, broadcast=False)

    try:
        result = ChatService.save_message(user_id, message)
        new_message = {
            'id': result[0],
            'created_at': result[1],
            'username': data.get('username', 'Usuário'),
            'message': message
        }
        emit('receive_message', new_message, broadcast=True)
    except Exception as e:
        emit('error', {'message': str(e)}, broadcast=False)